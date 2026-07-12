## 1. Data Model and Contracts

- [ ] 1.1 Add the `creatorOpportunities` Drizzle schema, status/source types, indexes, and an additive SQL migration without runtime production schema mutation.
- [ ] 1.2 Add Zod request and generated-brief schemas plus JSON parsing helpers that preserve a prior valid draft on failure.
- [ ] 1.3 Add page-scoped opportunity data helpers for create, list, update, approve, dismiss, and source-snapshot resolution.

## 2. Owner-Only API and AI Generation

- [ ] 2.1 Add owner-only list/create and item update endpoints with source ownership validation and bounded field lengths.
- [ ] 2.2 Add the explicit generation endpoint using existing AI configuration, rate limiting, bounded profile/source context, and structured-output validation.
- [ ] 2.3 Implement lifecycle guards: only valid drafts approve, material edits clear approval, dismissed sources remain intact, and failures preserve stored work.
- [ ] 2.4 Ensure API responses fail closed and explain recovery when the table or AI provider is unavailable.

## 3. Opportunity Desk UI

- [ ] 3.1 Add `/dashboard/opportunities` with empty, loading, error, signal, drafted, approved, and dismissed states using existing dashboard patterns.
- [ ] 3.2 Add manual opportunity creation and eligible page-owned source selection from timeline and existing inbound/lead surfaces.
- [ ] 3.3 Add the brief review editor for fit, timing, partnership angles, named-brand verification labels, recipient, subject, and body.
- [ ] 3.4 Add explicit Generate, Approve, Dismiss, Copy, and Open in mail actions; expose Open in mail only for approved drafts with a verified recipient.
- [ ] 3.5 Add Opportunity Desk to dashboard navigation and link relevant Lead Radar and Timeline source records into the workflow.

## 4. Verification and Handoff

- [ ] 4.1 Add unit tests for generated-brief parsing, source ownership, lifecycle transitions, approval reset, and mailto construction.
- [ ] 4.2 Add focused API tests covering cross-owner rejection, invalid sources, AI failure, invalid model JSON, and missing-table behavior.
- [ ] 4.3 Run the focused tests first, then `pnpm typecheck`, `pnpm lint`, and the smallest relevant build check; record any skipped or environment-blocked validation.
- [ ] 4.4 Update `PROJECT_STATUS.md` and user-facing help/copy only after the feature is implemented and verified; do not claim Gmail/social monitoring or autonomous sending.
