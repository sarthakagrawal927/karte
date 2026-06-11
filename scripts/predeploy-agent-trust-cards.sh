#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB="${KARTE_D1_DATABASE:-linkchat-auth}"
BASE_URL="${KARTE_BASE_URL:-https://karte.cc}"

echo "==> Agent trust cards pre-deploy"
echo "    D1 database: ${DB}"
echo "    Base URL:    ${BASE_URL}"
echo

echo "==> 1/4 D1 migrations"
pnpm exec wrangler d1 execute "${DB}" --remote --file="${ROOT}/migrations/d1/006_agent_trust_cards.sql"
pnpm exec wrangler d1 execute "${DB}" --remote --file="${ROOT}/migrations/d1/007_agent_auth_abuse.sql"

echo
echo "==> 2/4 Email sending domain (idempotent if already enabled)"
pnpm exec wrangler email sending enable karte.cc || true

echo
echo "==> 3/4 Seed Atlas demo agent"
node "${ROOT}/scripts/seed-agent-demo.mjs" | pnpm exec wrangler d1 execute "${DB}" --remote --file=-

echo
echo "==> 4/4 Smoke checks"
node "${ROOT}/scripts/smoke-agent-api.mjs" --base-url "${BASE_URL}"

echo
echo "Pre-deploy steps finished. Merge PR and deploy, then optionally rerun:"
echo "  KARTE_SMOKE_EMAIL=ops@example.com KARTE_SMOKE_CODE=123456 node scripts/smoke-agent-api.mjs --base-url ${BASE_URL}"
