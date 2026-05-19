/**
 * SQLite wrapper.
 *
 * better-sqlite3 is synchronous (which is fine here — it's an in-process
 * embedded DB and the BFF is single-tenant). We expose a small typed-ish
 * API instead of leaking raw SQL all over the routes.
 */
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'db', 'lunara.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db;

function init() {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
}

function get() {
  if (!db) init();
  return db;
}

// ─── Users ──────────────────────────────────────────────────────────
function upsertUser(userId, profile) {
  get()
    .prepare(
      `INSERT INTO users (id, profile_json, created_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET profile_json = excluded.profile_json`
    )
    .run(userId, JSON.stringify(profile || {}), Date.now());
}

function getUser(userId) {
  const row = get().prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!row) return null;
  return { id: row.id, profile: JSON.parse(row.profile_json), createdAt: row.created_at };
}

// ─── Daily logs ─────────────────────────────────────────────────────
function saveDailyLog({ userId, logDate, moods, symptoms, notes }) {
  get()
    .prepare(
      `INSERT INTO daily_logs (user_id, log_date, moods_json, symptoms_json, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, log_date) DO UPDATE SET
         moods_json    = excluded.moods_json,
         symptoms_json = excluded.symptoms_json,
         notes         = excluded.notes`
    )
    .run(
      userId,
      logDate,
      JSON.stringify(moods || []),
      JSON.stringify(symptoms || []),
      notes || '',
      Date.now()
    );
}

function getRecentLogs(userId, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const rows = get()
    .prepare(
      `SELECT log_date, moods_json, symptoms_json, notes
       FROM daily_logs
       WHERE user_id = ? AND log_date >= ?
       ORDER BY log_date DESC`
    )
    .all(userId, sinceStr);

  return rows.map((r) => ({
    date: r.log_date,
    moods: JSON.parse(r.moods_json),
    symptoms: JSON.parse(r.symptoms_json),
    notes: r.notes,
  }));
}

// ─── Chat messages ──────────────────────────────────────────────────
function saveChatMessage({ userId, role, content, toolCalls }) {
  get()
    .prepare(
      `INSERT INTO chat_messages (user_id, role, content, tool_calls_json, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(userId, role, content, toolCalls ? JSON.stringify(toolCalls) : null, Date.now());
}

function getChatHistory(userId, limit = 20) {
  const rows = get()
    .prepare(
      `SELECT role, content, tool_calls_json, created_at
       FROM chat_messages WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ?`
    )
    .all(userId, limit);
  return rows.reverse().map((r) => ({
    role: r.role,
    content: r.content,
    toolCalls: r.tool_calls_json ? JSON.parse(r.tool_calls_json) : null,
    createdAt: r.created_at,
  }));
}

// ─── LLM call audit ─────────────────────────────────────────────────
function recordLlmCall(call) {
  get()
    .prepare(
      `INSERT INTO llm_calls
       (user_id, template_id, model, prompt_tokens, completion_tokens, total_tokens,
        latency_ms, tools_used_json, status, error, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      call.userId || null,
      call.templateId || null,
      call.model,
      call.promptTokens || 0,
      call.completionTokens || 0,
      call.totalTokens || 0,
      call.latencyMs || 0,
      call.toolsUsed ? JSON.stringify(call.toolsUsed) : null,
      call.status,
      call.error || null,
      Date.now()
    );
}

function getRecentLlmCalls(limit = 100) {
  return get()
    .prepare(`SELECT * FROM llm_calls ORDER BY created_at DESC LIMIT ?`)
    .all(limit);
}

function getTokenUsageByDay(days = 14) {
  return get()
    .prepare(
      `SELECT
         strftime('%Y-%m-%d', created_at / 1000, 'unixepoch') AS day,
         SUM(total_tokens) AS tokens,
         COUNT(*) AS calls
       FROM llm_calls
       WHERE created_at >= ?
       GROUP BY day ORDER BY day`
    )
    .all(Date.now() - days * 86400000);
}

module.exports = {
  init,
  upsertUser,
  getUser,
  saveDailyLog,
  getRecentLogs,
  saveChatMessage,
  getChatHistory,
  recordLlmCall,
  getRecentLlmCalls,
  getTokenUsageByDay,
};
