-- Karte app tables on D1 — port from Turso.
-- All idempotent so re-runs are safe.

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  bio TEXT,
  avatarUrl TEXT,
  themeConfig TEXT,
  published INTEGER DEFAULT 0,
  chatEnabled INTEGER DEFAULT 0,
  chatSystemPrompt TEXT,
  dmMode TEXT NOT NULL DEFAULT 'off',
  encyclopediaEnabled INTEGER DEFAULT 0,
  roastEnabled INTEGER DEFAULT 0,
  newspaperEnabled INTEGER DEFAULT 0,
  pageSettings TEXT,
  scrapedContent TEXT,
  createdAt INTEGER,
  updatedAt INTEGER
);

CREATE TABLE IF NOT EXISTS generatedPages (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt INTEGER,
  updatedAt INTEGER
);

CREATE INDEX IF NOT EXISTS generated_pages_page_id_type_idx
  ON generatedPages (pageId, type);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  sortOrder INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  imageUrl TEXT,
  description TEXT NOT NULL,
  sortOrder INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS projects_page_id_sort_order_idx
  ON projects (pageId, sortOrder);

CREATE TABLE IF NOT EXISTS infoBlocks (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  smDocumentId TEXT,
  sortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pageSections (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  buttonLabel TEXT,
  buttonUrl TEXT,
  sortOrder INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS page_sections_page_id_sort_order_idx
  ON pageSections (pageId, sortOrder);

CREATE TABLE IF NOT EXISTS contactSubmissions (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  sectionId TEXT,
  visitorId TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  senderType TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'unread',
  message TEXT NOT NULL,
  createdAt INTEGER
);

CREATE INDEX IF NOT EXISTS contact_submissions_page_id_created_at_idx
  ON contactSubmissions (pageId, createdAt);

CREATE TABLE IF NOT EXISTS pageEvents (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  visitorId TEXT,
  eventType TEXT NOT NULL,
  resourceType TEXT,
  resourceId TEXT,
  resourceLabel TEXT,
  metadata TEXT,
  createdAt INTEGER
);

CREATE INDEX IF NOT EXISTS page_events_page_id_event_type_created_at_idx
  ON pageEvents (pageId, eventType, createdAt);

CREATE TABLE IF NOT EXISTS dailyStats (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  eventType TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  visitors INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS daily_stats_uniqueness_idx
  ON dailyStats (pageId, date, eventType);

CREATE TABLE IF NOT EXISTS dailyResourceStats (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  eventType TEXT NOT NULL,
  resourceType TEXT NOT NULL,
  resourceId TEXT NOT NULL,
  resourceLabel TEXT,
  count INTEGER NOT NULL DEFAULT 0,
  visitors INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS daily_resource_stats_uniqueness_idx
  ON dailyResourceStats (pageId, date, eventType, resourceId);

CREATE TABLE IF NOT EXISTS dailyVisitorEvents (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  visitorId TEXT NOT NULL,
  date TEXT NOT NULL,
  eventType TEXT NOT NULL,
  resourceId TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS daily_visitor_events_uniqueness_idx
  ON dailyVisitorEvents (pageId, visitorId, date, eventType, resourceId);

CREATE TABLE IF NOT EXISTS pageDomains (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  hostname TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  isPrimary INTEGER NOT NULL DEFAULT 0,
  verification TEXT,
  errorMessage TEXT,
  lastCheckedAt INTEGER,
  createdAt INTEGER,
  updatedAt INTEGER
);

CREATE INDEX IF NOT EXISTS page_domains_page_id_idx
  ON pageDomains (pageId);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY NOT NULL,
  pageId TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  visitorId TEXT,
  visitorEmail TEXT,
  createdAt INTEGER
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY NOT NULL,
  conversationId TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt INTEGER
);
