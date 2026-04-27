-- Initial schema for linkchat (D1, better-auth + app tables).
-- Better-auth tables MUST be singular (`user`, `session`, `account`,
-- `verification`) — that is the default the drizzleAdapter resolves to
-- when no `schema:` mapping is passed.

CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "smProjectId" TEXT,
  "smApiKey" TEXT,
  "smIndexId" TEXT,
  "aiEndpointUrl" TEXT,
  "aiApiKey" TEXT,
  "aiModel" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" INTEGER,
  "refreshTokenExpiresAt" INTEGER,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "createdAt" INTEGER,
  "updatedAt" INTEGER
);

-- App tables ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS "pages" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "slug" TEXT NOT NULL UNIQUE,
  "displayName" TEXT NOT NULL,
  "bio" TEXT,
  "avatarUrl" TEXT,
  "themeConfig" TEXT,
  "published" INTEGER DEFAULT 0,
  "chatEnabled" INTEGER DEFAULT 0,
  "chatSystemPrompt" TEXT,
  "encyclopediaEnabled" INTEGER DEFAULT 0,
  "roastEnabled" INTEGER DEFAULT 0,
  "newspaperEnabled" INTEGER DEFAULT 0,
  "pageSettings" TEXT,
  "scrapedContent" TEXT,
  "createdAt" INTEGER,
  "updatedAt" INTEGER
);

CREATE TABLE IF NOT EXISTS "generatedPages" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "pageId" TEXT NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "content" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" INTEGER,
  "updatedAt" INTEGER
);

CREATE TABLE IF NOT EXISTS "links" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "pageId" TEXT NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "icon" TEXT,
  "sortOrder" INTEGER DEFAULT 0,
  "enabled" INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "projects" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "pageId" TEXT NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "imageUrl" TEXT,
  "description" TEXT NOT NULL,
  "sortOrder" INTEGER DEFAULT 0,
  "enabled" INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "infoBlocks" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "pageId" TEXT NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "title" TEXT,
  "content" TEXT NOT NULL,
  "smDocumentId" TEXT,
  "sortOrder" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "pageSections" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "pageId" TEXT NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "buttonLabel" TEXT,
  "buttonUrl" TEXT,
  "sortOrder" INTEGER DEFAULT 0,
  "enabled" INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "contactSubmissions" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "pageId" TEXT NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
  "sectionId" TEXT,
  "visitorId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" INTEGER
);

CREATE TABLE IF NOT EXISTS "pageEvents" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "pageId" TEXT NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
  "visitorId" TEXT,
  "eventType" TEXT NOT NULL,
  "resourceType" TEXT,
  "resourceId" TEXT,
  "resourceLabel" TEXT,
  "metadata" TEXT,
  "createdAt" INTEGER
);

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "pageId" TEXT NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
  "visitorId" TEXT,
  "createdAt" INTEGER
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "conversationId" TEXT NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" INTEGER
);

CREATE INDEX IF NOT EXISTS "idx_pages_user" ON "pages"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_user" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "idx_account_user" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "idx_pageEvents_page" ON "pageEvents"("pageId", "createdAt");
