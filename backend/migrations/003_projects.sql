PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  external_ref TEXT UNIQUE,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'delivery',
  project_manager TEXT NOT NULL DEFAULT '',
  director TEXT NOT NULL DEFAULT '',
  health_score INTEGER NOT NULL DEFAULT 0,
  health_status TEXT NOT NULL DEFAULT 'red',
  jira_risk TEXT NOT NULL DEFAULT 'low',
  delivery_risk INTEGER NOT NULL DEFAULT 0,
  milestone_confidence INTEGER NOT NULL DEFAULT 0,
  active_signals INTEGER NOT NULL DEFAULT 0,
  open_actions INTEGER NOT NULL DEFAULT 0,
  next_milestone TEXT NOT NULL DEFAULT '',
  due_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (customer_id, normalized_name)
);

CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_health ON projects(health_score);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
