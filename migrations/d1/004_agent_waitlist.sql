-- Card IV of the landing page captures emails until the agent
-- subtype ships. One row per email; insert is idempotent by way of
-- the unique constraint.
CREATE TABLE IF NOT EXISTS agentWaitlist (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  createdAt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_agentWaitlist_createdAt ON agentWaitlist (createdAt);
