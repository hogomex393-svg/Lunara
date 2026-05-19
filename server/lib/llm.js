/**
 * OpenRouter client + Agent loop.
 *
 * runAgent({ template, userMessages, ctx }):
 *   1. builds the message stack: system (template + context) + history + user
 *   2. calls OpenRouter with the template's allowed tools
 *   3. if the model returns tool_calls, runs each via tools.runTool, appends
 *      the results as `role: tool` messages, and loops again
 *   4. stops on `finish_reason: stop` OR after MAX_TURNS to avoid runaway loops
 *
 * Records every round trip into the llm_calls audit table.
 */
const tools = require('./tools');
const db = require('./db');
const logger = require('./logger');

const MAX_TURNS = 4;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter({ model, messages, toolDefs, temperature, maxTokens }) {
  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (toolDefs && toolDefs.length) {
    body.tools = toolDefs;
    body.tool_choice = 'auto';
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lunara.app',
      'X-Title': 'Lunara',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * @param {object} opts
 * @param {object} opts.template      from prompts.getTemplate()
 * @param {string} opts.systemContext extra context block to append after template.system
 * @param {Array}  opts.history       [{role, content}, ...]
 * @param {string} opts.userMessage   newest user input
 * @param {object} opts.ctx           { userId } — passed into tool handlers
 */
async function runAgent({ template, systemContext, history, userMessage, ctx }) {
  const systemContent =
    template.system + (systemContext ? `\n\n${systemContext}` : '');

  const messages = [
    { role: 'system', content: systemContent },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const toolDefs = tools.toolDefsFor(template.tools);
  const toolsUsed = [];
  const model = process.env.LLM_MODEL || 'meta-llama/llama-3.3-70b-instruct';

  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  const t0 = Date.now();

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    let resp;
    try {
      resp = await callOpenRouter({
        model,
        messages,
        toolDefs,
        temperature: template.temperature,
        maxTokens: template.maxTokens,
      });
    } catch (err) {
      db.recordLlmCall({
        userId: ctx.userId,
        templateId: template.id,
        model,
        latencyMs: Date.now() - t0,
        toolsUsed,
        status: 'error',
        error: err.message,
      });
      throw err;
    }

    const choice = resp.choices?.[0];
    if (!choice) throw new Error('no choices in response');
    const msg = choice.message;
    totalPromptTokens += resp.usage?.prompt_tokens || 0;
    totalCompletionTokens += resp.usage?.completion_tokens || 0;

    // If the model wants to call tools, run them and loop
    if (msg.tool_calls && msg.tool_calls.length) {
      messages.push({
        role: 'assistant',
        content: msg.content || '',
        tool_calls: msg.tool_calls,
      });
      for (const call of msg.tool_calls) {
        const name = call.function.name;
        toolsUsed.push(name);
        const result = tools.runTool(name, call.function.arguments, ctx);
        logger.info({ type: 'tool_call', name, args: call.function.arguments, result });
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: result,
        });
      }
      continue;
    }

    // Final answer
    const latencyMs = Date.now() - t0;
    db.recordLlmCall({
      userId: ctx.userId,
      templateId: template.id,
      model,
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      totalTokens: totalPromptTokens + totalCompletionTokens,
      latencyMs,
      toolsUsed,
      status: 'ok',
    });
    logger.info({
      type: 'llm_call',
      templateId: template.id,
      model,
      latencyMs,
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      toolsUsed,
    });
    return {
      reply: msg.content || '',
      toolsUsed,
      usage: {
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
        totalTokens: totalPromptTokens + totalCompletionTokens,
      },
      latencyMs,
    };
  }

  throw new Error(`Agent loop did not converge after ${MAX_TURNS} turns`);
}

module.exports = { runAgent };
