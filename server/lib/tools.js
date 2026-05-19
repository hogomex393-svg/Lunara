/**
 * Agent tool registry.
 *
 * Each tool has:
 *  - an OpenAI-compatible schema (so we can pass it directly as `tools`
 *    in the OpenRouter chat-completion call)
 *  - a server-side handler that resolves args -> string result
 *
 * The handler returns a STRING (not an object) — the Agent loop in llm.js
 * stuffs it back into the `tool` role message verbatim. Stringly-typed
 * payloads keep the loop simple and let the LLM see exactly what the user
 * would see if they ran the same query.
 */
const db = require('./db');
const { cyclePhase } = require('./context');

const TOOL_DEFS = [
  {
    type: 'function',
    function: {
      name: 'get_cycle_phase',
      description:
        "Return the user's current menstrual cycle day and phase " +
        '(menstrual / follicular / ovulatory / luteal) based on the last ' +
        'period start date recorded during onboarding.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_symptoms',
      description:
        "Return the user's logged moods, symptoms, and notes for the past N days. " +
        'Use this for any question about patterns, frequency, or "why am I feeling X" queries.',
      parameters: {
        type: 'object',
        properties: {
          days: {
            type: 'integer',
            description: 'How many days back to look (1-30). Default 7.',
            minimum: 1,
            maximum: 30,
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_user_profile',
      description:
        "Return the user's onboarding profile: age band, cycle regularity, pain level, medications, etc.",
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_advice_card',
      description:
        'Pick the best built-in advice card for the user given a category. ' +
        'Categories: diet, emotional, movement, sleep, hydration. ' +
        'Use this when the user wants concrete, actionable suggestions.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['diet', 'emotional', 'movement', 'sleep', 'hydration'],
          },
        },
        required: ['category'],
      },
    },
  },
];

const ADVICE_CARDS = {
  diet: 'During the luteal phase, try complex carbs (oats, sweet potato) and magnesium-rich foods (dark chocolate, almonds) to ease cravings and cramps.',
  emotional:
    'Brief 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s) ×3 rounds. Pair with naming the emotion out loud — it reliably reduces amygdala reactivity.',
  movement:
    '20-minute slow walk or restorative yoga (child\'s pose → cat-cow → legs-up-the-wall). Skip high-intensity work during day 1-3 of the menstrual phase.',
  sleep:
    'Cool the bedroom to 18-20°C. Magnesium glycinate 200-300mg 30 min before bed can help with PMS-related insomnia. Avoid screens after 22:30.',
  hydration:
    'Aim for body-weight (kg) × 30 ml of water daily. Add a pinch of sea salt + lemon to one glass to support electrolyte balance during heavier flow days.',
};

const HANDLERS = {
  get_cycle_phase: (_args, ctx) => {
    const user = db.getUser(ctx.userId);
    const { phase, cycleDay } = cyclePhase(user?.profile?.lastPeriodStart);
    return JSON.stringify({ phase, cycleDay });
  },
  get_recent_symptoms: (args, ctx) => {
    const days = Math.min(Math.max(args?.days || 7, 1), 30);
    const logs = db.getRecentLogs(ctx.userId, days);
    return JSON.stringify({ windowDays: days, logCount: logs.length, logs });
  },
  get_user_profile: (_args, ctx) => {
    const user = db.getUser(ctx.userId);
    return JSON.stringify(user?.profile || {});
  },
  suggest_advice_card: (args) => {
    const card = ADVICE_CARDS[args?.category];
    return JSON.stringify({ category: args?.category, tip: card || 'no card for that category' });
  },
};

function runTool(name, argsJson, ctx) {
  const handler = HANDLERS[name];
  if (!handler) return JSON.stringify({ error: `unknown tool ${name}` });
  let args = {};
  try {
    args = argsJson ? JSON.parse(argsJson) : {};
  } catch {
    /* ignore bad JSON from the model */
  }
  try {
    return handler(args, ctx);
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

function toolDefsFor(allowedNames) {
  if (!allowedNames || !allowedNames.length) return [];
  const allow = new Set(allowedNames);
  return TOOL_DEFS.filter((t) => allow.has(t.function.name));
}

module.exports = { TOOL_DEFS, runTool, toolDefsFor, ADVICE_CARDS };
