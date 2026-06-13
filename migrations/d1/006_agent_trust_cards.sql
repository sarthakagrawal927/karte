-- Agent trust cards: page subtype fields, API keys, and auth codes.

ALTER TABLE pages ADD COLUMN pageType TEXT NOT NULL DEFAULT 'person';
ALTER TABLE pages ADD COLUMN verifiedDomain TEXT;
ALTER TABLE pages ADD COLUMN verifiedAt INTEGER;
ALTER TABLE pages ADD COLUMN verificationMethod TEXT;
ALTER TABLE pages ADD COLUMN verificationToken TEXT;
ALTER TABLE pages ADD COLUMN agentPurpose TEXT;
ALTER TABLE pages ADD COLUMN agentOperator TEXT;
ALTER TABLE pages ADD COLUMN agentOperatorUrl TEXT;
ALTER TABLE pages ADD COLUMN agentCapabilities TEXT;
ALTER TABLE pages ADD COLUMN agentDisclosurePolicy TEXT;
ALTER TABLE pages ADD COLUMN brainEndpointUrl TEXT;
ALTER TABLE pages ADD COLUMN brainEndpointAuth TEXT;
ALTER TABLE pages ADD COLUMN brainEndpointShape TEXT DEFAULT 'openai-chat';

CREATE INDEX IF NOT EXISTS idx_pages_pageType ON pages (pageType);
CREATE INDEX IF NOT EXISTS idx_pages_userId_pageType ON pages (userId, pageType);

CREATE TABLE IF NOT EXISTS apiKeys (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keyPrefix TEXT NOT NULL,
  keyHash TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  revokedAt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_apiKeys_userId ON apiKeys (userId);
CREATE INDEX IF NOT EXISTS idx_apiKeys_keyHash ON apiKeys (keyHash);

CREATE TABLE IF NOT EXISTS agentAuthCodes (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  codeHash TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agentAuthCodes_email ON agentAuthCodes (email);
CREATE INDEX IF NOT EXISTS idx_agentAuthCodes_expiresAt ON agentAuthCodes (expiresAt);
