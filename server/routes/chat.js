/**
 * POST /api/chat
 *
 * Body:
 *   { userId, message, templateId?, useContext? }
 *
 * Returns:
 *   { reply, toolsUsed, usage, latencyMs, templateId }
 *
 * GET /api/chat/history?userId=...
 */
const express = require('express');
const router = express.Router();

const db = require('../lib/db');
const prompts = require('../lib/prompts');
const { buildContext } = require('../lib/context');
const { runAgent } = require('../lib/llm');

router.post('/', async (req, res, next) => {
  try {
    const { userId, message, templateId, useContext = true } = req.body || {};
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const template = prompts.getTemplate(templateId);
    const systemContext = useContext ? buildContext(userId) : '';

    // Pull recent history (trim to last 10 turns to keep token usage bounded)
    const history = db.getChatHistory(userId, 10).map((m) => ({
      role: m.role === 'tool' ? 'assistant' : m.role,
      content: m.content,
    }));

    db.saveChatMessage({ userId, role: 'user', content: message });

    const result = await runAgent({
      template,
      systemContext,
      history,
      userMessage: message,
      ctx: { userId },
    });

    db.saveChatMessage({
      userId,
      role: 'assistant',
      content: result.reply,
      toolCalls: result.toolsUsed,
    });

    res.json({
      reply: result.reply,
      toolsUsed: result.toolsUsed,
      usage: result.usage,
      latencyMs: result.latencyMs,
      templateId: template.id,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/history', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  res.json({ messages: db.getChatHistory(userId, 50) });
});

module.exports = router;
