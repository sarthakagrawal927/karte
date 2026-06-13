-- Abuse tracking for agent email-code auth.

ALTER TABLE agentAuthCodes ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE agentAuthCodes ADD COLUMN ipHash TEXT;

CREATE TABLE IF NOT EXISTS agentAuthSendLog (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  ipHash TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agentAuthSendLog_createdAt ON agentAuthSendLog (createdAt);
CREATE INDEX IF NOT EXISTS idx_agentAuthSendLog_email_createdAt ON agentAuthSendLog (email, createdAt);
