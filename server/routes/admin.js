/**
 * Admin routes — protected by a bearer token (ADMIN_PASSWORD).
 *
 *   GET  /api/admin/templates              — list prompt templates
 *   POST /api/admin/templates/:id          — patch a template (system / temperature / maxTokens / tools)
 *   GET  /api/admin/calls?limit=100        — recent LLM call audit log
 *   GET  /api/admin/usage?days=14          — token usage by day, for the chart
 */
const express = require('express');
const router = express.Router();

const db = require('../lib/db');
const prompts = require('../lib/prompts');

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_PASSWORD || 'lunara-admin-2026';
  const got = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (got !== expected) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

router.use(requireAdmin);

router.get('/templates', (_req, res) => {
  res.json({ templates: prompts.listTemplates() });
});

router.get('/templates/:id', (req, res) => {
  const tpl = prompts.getTemplate(req.params.id);
  res.json(tpl);
});

router.post('/templates/:id', (req, res) => {
  try {
    const updated = prompts.saveTemplate(req.params.id, req.body || {});
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/calls', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  res.json({ calls: db.getRecentLlmCalls(limit) });
});

router.get('/usage', (req, res) => {
  const days = Math.min(Number(req.query.days) || 14, 60);
  res.json({ usage: db.getTokenUsageByDay(days) });
});

module.exports = router;
