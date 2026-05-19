/**
 * Structured logger.
 *
 * Two transports:
 *  1. Pretty console output for local dev (pino-pretty)
 *  2. JSONL file at LOG_FILE for the admin panel to read & aggregate
 *
 * Every LLM call writes a `type: 'llm_call'` event with model, latency,
 * token usage, prompt hash, and template id — this is what powers the
 * admin "调用日志" and "Token 用量统计" panels.
 */
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const LOG_FILE =
  process.env.LOG_FILE || path.join(__dirname, '..', 'logs', 'llm-calls.jsonl');

// Make sure logs directory exists
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

const streams = [
  {
    level: 'info',
    stream: pino.transport({
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss' },
    }),
  },
  { level: 'info', stream: fs.createWriteStream(LOG_FILE, { flags: 'a' }) },
];

const logger = pino({ level: 'info' }, pino.multistream(streams));

module.exports = logger;
module.exports.LOG_FILE = LOG_FILE;
