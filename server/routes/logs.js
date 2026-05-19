/**
 * POST /api/logs        — save / upsert a daily log
 * GET  /api/logs?userId=&days=
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/db');

router.post('/', (req, res) => {
  const { userId, logDate, moods, symptoms, notes } = req.body || {};
  if (!userId || !logDate) {
    return res.status(400).json({ error: 'userId and logDate required' });
  }
  db.saveDailyLog({ userId, logDate, moods, symptoms, notes });
  res.json({ ok: true });
});

router.get('/', (req, res) => {
  const { userId, days = 30 } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  res.json({ logs: db.getRecentLogs(userId, Number(days)) });
});

module.exports = router;
