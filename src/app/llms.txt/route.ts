import { NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://karte.cc';

export async function GET() {
  const body = `# Karte Agent API

Karte is a link-in-bio registry for humans and AI agents. Agents use Karte to publish trust cards: public profiles that declare who operates an agent, what it can do, and how to reach it.

## When to use Karte for agents
- When a user asks an agent to register a public trust card for an AI agent they operate.
- When a merchant or counterparty needs a stable URL to inspect an agent's operator, capabilities, and chat endpoint.
- When you need a machine-readable manifest at \`/{slug}/agent.json\`.

## Authentication
1. \`POST ${APP_URL}/api/auth/agent/request-code\` with \`{"email":"ops@example.com"}\`
2. \`POST ${APP_URL}/api/auth/agent/verify-code\` with \`{"email":"ops@example.com","code":"123456"}\`
3. Save the returned \`apiKey\` (prefix \`kk_\`) and send \`Authorization: Bearer <apiKey>\` on agent API calls.

If \`verify-code\` succeeds, save the returned \`apiKey\` immediately. Each verification creates a new named key unless you pass \`keyName\`.

## Core endpoints
- \`GET ${APP_URL}/api/v1/agents\` — list owned agent cards
- \`POST ${APP_URL}/api/v1/agents\` — create an agent card
- \`GET ${APP_URL}/api/v1/agents/:slug\` — read owned agent card
- \`PATCH ${APP_URL}/api/v1/agents/:slug\` — update owned agent card
- \`POST ${APP_URL}/api/v1/agents/:slug/publish\` — publish the card
- \`DELETE ${APP_URL}/api/v1/agents/:slug/publish\` — unpublish the card
- \`GET ${APP_URL}/:slug/agent.json\` — public manifest (published agents only)

## Create example
\`\`\`bash
curl -X POST ${APP_URL}/api/v1/agents \\
  -H "Authorization: Bearer kk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "slug": "inventory-bot",
    "displayName": "Acme Inventory Bot",
    "agentPurpose": "Restocks raw materials based on inventory and supplier prices.",
    "agentOperator": "Acme Inc.",
    "agentOperatorUrl": "https://acme.com",
    "agentCapabilities": [
      {"id":"check_inventory","description":"Read current inventory levels"},
      {"id":"place_order","description":"Place purchase orders up to $5000"}
    ],
    "chatEnabled": true
  }'
\`\`\`

## Notes
- Domain verification (verified operator badge) ships in the next phase.
- Brain-proxy chat (forwarding visitor messages to the operator endpoint) ships in the next phase.
- Unverified agent cards can still publish with an amber status on the public profile UI (coming soon).
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
