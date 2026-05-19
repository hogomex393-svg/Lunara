/**
 * Lunara BFF — entry point.
 *
 * Why a BFF?
 *  - Keeps the OpenRouter API key off the browser
 *  - Lets us inject business context (user profile, cycle data, recent logs)
 *    into prompts before they hit the LLM
 *  - Centralised logging, prompt versioning, and rate control
 *  - Hosts the Agent loop (function calling) which the frontend should not own
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const logger = require('./lib/logger');
const db = require('./lib/db');

const chatRouter = require('./routes/chat');
const logsRouter = require('./routes/logs');
const adminRouter = require('./routes/admin');
const profileRouter = require('./routes/profile');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Request log middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      type: 'http',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/chat', chatRouter);
app.use('/api/logs', logsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/admin', adminRouter);

// Generic error handler
app.use((err, _req, res, _next) => {
  logger.error({ type: 'unhandled', err: err.message, stack: err.stack });
  res.status(500).json({ error: 'internal_error', message: err.message });
});

const PORT = process.env.PORT || 3001;

// Initialise database (idempotent)
db.init();

app.listen(PORT, () => {
  logger.info({ type: 'startup', port: PORT, model: process.env.LLM_MODEL });
  // eslint-disable-next-line no-console
  console.log(`[Lunara BFF] listening on http://localhost:${PORT}`);
});
