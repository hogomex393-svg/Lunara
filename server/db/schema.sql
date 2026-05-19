-- Lunara persistence schema.
-- Kept deliberately small: one user (single-tenant prototype), per-day logs,
-- chat history, and an llm_calls audit table used by the admin panel.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  profile_json TEXT NOT NULL,        -- onboarding answers
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  log_date TEXT NOT NULL,            -- YYYY-MM-DD
  moods_json TEXT NOT NULL,          -- ["happy","tired"]
  symptoms_json TEXT NOT NULL,       -- ["cramps"]
  notes TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date
  ON daily_logs(user_id, log_date DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','tool')),
  content TEXT NOT NULL,
  tool_calls_json TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_user_time
  ON chat_messages(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS llm_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  template_id TEXT,
  model TEXT NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  latency_ms INTEGER,
  tools_used_json TEXT,              -- ["get_cycle_phase","get_recent_symptoms"]
  status TEXT NOT NULL,              -- ok | error
  error TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_llm_calls_time
  ON llm_calls(created_at DESC);
