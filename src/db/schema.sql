-- Student Task Management System — SQLite schema
-- Run automatically by `npm run init-db`, or with the sqlite3 CLI.

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  user_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,                       -- bcrypt hash, never plaintext
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  task_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  category     TEXT DEFAULT 'General',             -- subject/category for analytics
  deadline     TEXT,                               -- 'YYYY-MM-DD' or NULL
  priority     TEXT NOT NULL DEFAULT 'medium'
                 CHECK (priority IN ('low','medium','high')),
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','completed')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,                               -- set when completed (weekly chart)
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_user     ON tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks (user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks (user_id, deadline);
