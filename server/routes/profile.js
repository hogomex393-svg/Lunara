/**
 * GET  /api/profile?userId=
 * POST /api/profile   { userId, profile }
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/db');

router.get('/', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  res.json(db.getUser(userId) || { id: userId, profile: {} });
});

router.post('/', (req, res) => {
  const { userId, profile } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });
  db.upsertUser(userId, profile || {});
  res.json({ ok: true });
});

module.exports = router;
