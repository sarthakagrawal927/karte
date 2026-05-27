import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

// Karte is now D1-only. Schema is authoritative; migrations live in
// `migrations/d1/*.sql` and are applied with:
//   wrangler d1 execute linkchat-auth --remote --file=migrations/d1/<file>
// Drizzle-kit's `generate` produces SQL we can copy into that folder.
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
});
