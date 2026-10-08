# Billing invoices - Implementation Plan

## Overview
Synthetic mid-run plan: Phase 1 done, Phase 2 half ticked, Final has a prose item.

## Acceptance Criteria
1. - [ ] not a check — acceptance criteria checkboxes outside phases are ignored

## Phase 1: Stripe client + table

**Layer:** outbound I/O, State  ·  **Proves:** fetch and store invoices

### Phase Checks
- [x] `pnpm vitest stripe-invoices.test.ts` → pass
- [x] `pnpm db:migrate && pnpm vitest invoices.repo.test.ts` → pass

## Phase 2: syncInvoices

**Layer:** Function  ·  **Proves:** sync is idempotent

### Phase Checks
- [x] `pnpm vitest sync-invoices.test.ts` → pass
- [ ] `pnpm vitest sync-replay.test.ts` → pass

## Phase 3: Billing page

**Layer:** UI  ·  **Proves:** the page lists invoices

### Phase Checks
- [ ] `/dev-skills:qa-test` on `/billing` → pass

## Final Verification
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint` → clean
- [ ] Acceptance criteria: each verified with evidence

## Open Questions
- [ ] not a check either
