# Rollout Primitives

How to ship a change safely AND control who sees it when. Two mechanisms (feature flag, expand-contract), three decisions (contract / launch / risk), plus the decision tree for picking the lightest combination that does the job.

Flags are not just kill switches — they're also launch strategy (cohort, tier, timing, %-rollout, A/B). A safe feature with a coordinated launch still needs a flag, for the launch. Don't conflate "is it safe?" with "does it need a flag?".

## Why this matters more now

AI coding agents collapse build time. The same week's worth of code that used to ship gradually now lands in hours. The bottleneck shifts from "can we build it" to "can we ship it safely." Reversibility stops being a nice-to-have and becomes the actual constraint.

Two mechanisms produce reversibility. They operate at different speeds and granularities:

|                | Feature flag                              | Expand-contract                                    |
| -------------- | ----------------------------------------- | -------------------------------------------------- |
| Granularity    | Binary on/off for all users (or a cohort) | Per-consumer, per-migration-step                   |
| Rollback speed | Seconds (atomic toggle)                   | Consumer-migration time (hours to weeks)           |
| Surface        | Wraps a code path                         | Evolves a contract (schema, API, interface)        |
| Cost           | Code branches, test matrix, flag debt     | Extra phases, dual-write/dual-read, longer cleanup |

Neither is hygiene. Both have cost. The job of the planner is to pick the **lightest mechanism that achieves the reversibility actually needed** — and to know when no mechanism is needed at all.

## The decision tree

Three questions. The first one (contract) determines whether expand-contract applies. The other two (launch + risk) determine whether a flag applies. Either of the latter being "yes" → flag. Same flag covers both — never create two flags for one feature.

```
1. CONTRACT TEST: is a shared contract changing?
   (schema, public API, multi-consumer interface where consumers can't update atomically)
   ├─ NO  → contract mechanism: none
   └─ YES → contract mechanism: expand-contract

2. LAUNCH-STRATEGY TEST: who should see this, and when?
   ├─ "everyone, on deploy"                       → no launch flag
   ├─ "internal / dogfood / beta cohort"          → flag (launch flag)
   ├─ "tier / segment / geo / paid plan"          → flag (often permanent entitlement)
   ├─ "synchronized launch at time T"             → flag (timing gate)
   ├─ "% rollout (1% → 10% → 100%)"               → flag (gradual exposure)
   └─ "A/B variant"                               → flag (experiment)

3. KILL-SWITCH TEST: if this went bad in prod, what would I do?
   ├─ "revert + redeploy, no one notices"         → no risk flag
   ├─ "flip a flag in seconds"                    → flag (risk flag)
   └─ "page the team / no fast recovery"          → flag (risk flag) + runbook

COMBINE:
  ┌────────────────────────────────────────────────────────────────┐
  │ Contract  │ Launch OR Risk says flag │  Regime                 │
  │───────────┼──────────────────────────┼─────────────────────────│
  │ no        │ no                        │  NEITHER (direct deploy)│
  │ no        │ yes                       │  FLAG ALONE             │
  │ yes       │ no                        │  EXPAND-CONTRACT ALONE  │
  │ yes       │ yes                       │  BOTH                   │
  └────────────────────────────────────────────────────────────────┘
```

Sequence matters. Asking the contract question first often closes out the flag question via the substitution rule below — and asking launch and risk as peers stops the planner from concluding "no risk = no flag" on a feature that genuinely needs cohort or timing control.

## The substitution rule (the most-missed teaching)

**Well-executed expand-contract often makes a flag redundant.** The migration cadence IS the rollout — each migration step is small, observable, and independently reversible. That's the same safety property a flag provides, just at a different cadence.

Signs the flag is redundant on top of expand-contract:

- Each migration step is small and observable
- Each step is independently revertible (back out one consumer at a time)
- There's no "moment of cutover" — users adopt as their consumer migrates
- You can pause mid-migration and the system is stable

Signs you need the flag on top:

- A user-visible UI/UX swap that has to happen atomically for each user
- The new code path's correctness in prod is uncertain (separate risk from the contract change itself)
- Marketing/coordination requires "flip at time T for all users"
- You need to roll back faster than consumers can migrate back

## Mechanism 1: Feature flag

### Flags have two purposes

A flag is not just a kill switch. It's a **launch strategy** as much as a **risk-mitigation tool**. Either purpose justifies a flag. Most flags serve one or the other; some serve both.

|                     | **Launch-control flag**                                                  | **Reversibility flag**                                |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| Question it answers | _"Who should see this, and when?"_                                       | _"How do I turn it OFF if it goes bad?"_              |
| Typical use         | Dogfood, beta, tier, geo, %-rollout, A/B, coordinated launch             | Critical path, uncertain prod behavior, fast rollback |
| Lifecycle           | Often long-lived (permanent entitlement / gate)                          | Short-lived (remove once trusted)                     |
| Cleanup expectation | Designed to stay                                                         | Designed to be deleted; counts as debt if it stays past purpose |

A single flag can serve both purposes at once. Still one flag per feature.

### Test 1 — the launch-strategy test

> _"Who should see this, and when?"_

- **"Everyone, the moment it ships"** → no launch flag.
- **"Internal team only / dogfood, indefinitely"** → flag (audience gate).
- **"Beta cohort first, then expand"** → flag (cohort gate).
- **"Specific tier / segment / paid plan"** → flag (entitlement gate; usually permanent).
- **"Synchronized launch at announcement time T"** → flag (timing gate).
- **"Per-region / per-geo"** → flag (geo gate; can be permanent for compliance).
- **"Percentage rollout: 1% → 10% → 100%"** → flag (gradual exposure).
- **"Cohort A sees variant 1, cohort B sees variant 2"** → flag (A/B experiment).

### Test 2 — the kill-switch test

> _"If this change went bad in prod tomorrow, what would I do?"_

- **"Flip a flag in seconds"** → flag.
- **"Revert + redeploy, no one notices"** → no risk flag.
- **"Page the team / data is corrupted / users locked out / no fast recovery"** → flag + runbook.

A risk flag earns its keep when revert-and-redeploy is too slow, too coordinated, or too late. It does not earn its keep when revert-and-redeploy is acceptable for the blast radius.

### Flag when ANY of these is true

**Launch reasons** (controlling who/when):

1. **Cohort or staged rollout** — beta first, then general; per-org enablement.
2. **Tier or entitlement gate** — Pro plan only, enterprise feature, paid add-on.
3. **Coordinated launch** — flip at announcement time, marketing event, sales push.
4. **Geo or regional gate** — country-specific availability, compliance-driven restriction.
5. **Percentage rollout** — exposure ramps gradually (load, learning, caution).
6. **A/B test or experimentation** — measuring variant performance.
7. **Internal dogfooding** — team uses it before customers see it.
8. **Long-lived merge target** — feature spans multiple PRs, lands on `main` dark before lighting up.
9. **Depends on external state** — backfill running, third-party readiness, data migration in flight. Flag flips when dependency is ready.

**Risk reasons** (controlling how to turn it off):

10. **Critical path** — auth, billing, data writes, payments. A bad 5 minutes is unacceptable.
11. **Untrusted in prod** — change is correct in theory but unverified under production conditions.
12. **High-uncertainty bet** — might need to kill it entirely after seeing real usage.
13. **User-visible behavior change some users may reject** — workflow change, removed shortcut, UX redesign.

### DON'T flag when ALL of these are true

**No launch need:**

1. **Feature is for everyone** — no cohort, tier, geo, or timing reason to gate.
2. **No coordinated launch** — merge to main, it's live, nobody's waiting for a press release.

**No risk need:**

3. **Nothing calls it yet** — already ships dark; a flag adds nothing.
4. **Bug fix or correctness improvement** — you want it on for everyone immediately. Flagging a bug fix is malpractice.
5. **Internal refactor with no behavior change** — invisible by definition.
6. **Purely additive, low-risk UI** — new "Help" link, copy edit, icon swap, accessibility fix, a clearly-wanted new tab.
7. **Trivial blast radius** — admin-only, single-user, internal tool.
8. **Flag would create more risk than it removes** — e.g., flagging an auth-critical path where a misconfiguration on the flag toggle is worse than the change itself.

A change skips the flag only when *both* a launch reason and a risk reason are absent. A safe feature with a coordinated launch still gets a flag — for the launch, not the risk.

### Flag lifecycle — short-lived vs long-lived

Lifecycle depends on purpose. Don't conflate the two — different code patterns, different cleanup expectations.

- **Short-lived (risk flags, beta gates, dogfood gates, rollout %s)** — designed to be removed. Once the change is trusted at 100%, the flag is debt. Plan its removal in the same plan that introduces it (typically a "Phase N+1: remove flag" entry, scheduled weeks/months later). A risk flag sitting at 100% on for >30 days with no rollback need is flag debt — remove it.
- **Long-lived (tier/entitlement gates, geo gates, A/B-test-turned-permanent-segmentation)** — designed to stay. These are access-control primitives, not feature toggles. Code them with that in mind: clear naming (`is_pro_user`, `feature_available_in_region`), no plan to remove.

Anti-pattern: treating a tier gate like a release flag and trying to "rip it out" once everyone's on Pro — you'll just need it again next quarter. Anti-pattern: treating a risk flag like a permanent gate and letting it accumulate as code-branch debt for years.

### One flag per feature, not per phase

The naive (wrong) pattern AI agents produce by default: a flag per implementation phase, because each phase looks like a separate thing to gate. This fragments the user-visible feature across multiple toggles, makes "is this on?" ambiguous, and means rollback requires flipping N flags in the right order.

**Right model:**

```
feature_x_enabled  ← ONE flag, scoped to the user-perceived boundary

Phase 1: schema additions      → ships DARK (additive, no behavior change, no flag needed)
Phase 2: new API endpoint      → ships DARK if no caller; otherwise gated by feature_x_enabled
Phase 3: UI entry point        → gated by feature_x_enabled  ← this is what lights it up
Phase 4: contract (drop old)   → only after flag is 100% on and old path is dead
```

The flag goes at the **user-perceived boundary** — usually the UI surface, route, CTA, or public API method the consumer calls. Not at every internal layer. Internal layers ship dark because nothing reads them yet; the flag at the entrypoint is what wires the dark code into a user-visible feature.

### Discovering the flag system

The flag system varies wildly across codebases. Discover it; don't assume it.

Lookup order:

1. Read `.tap/architecture.md` for a feature-flags section.
2. Fall back: grep for known imports (`posthog`, `launchdarkly`, `unleash`, `flagsmith`) or config patterns (`flags.ts`, `feature-flags.yml`, env var conventions like `NEXT_PUBLIC_FEATURE_*`, DB-driven `feature_flags` table, per-cohort static config files).
3. If none found: ask the user or surface "no flag system detected — name one or treat this as direct deploy."

If a repo has no flag infra and a change genuinely needs flag-speed rollback, the right output is not "invent a flag system mid-implementation." It's "flag infra is a prerequisite for this change; install one first, or reduce scope so direct deploy is acceptable."

## Mechanism 2: Expand-contract

### The consumer-atomicity test

> _"If I change this contract in place and ship, will anything break during the gap between my code deploying and consumers updating?"_

- **No — I control all consumers and they ship together, OR the change is purely additive** → direct change.
- **Yes — consumers are external (other services, mobile apps, third parties), the change removes/renames something existing depends on, or data must be backfilled before reads work** → expand-contract.

The trigger isn't blast radius — it's whether atomic update is possible.

### The three surfaces (same pattern)

**Database schema**

1. **Expand** — add new column / table / index, nullable or with default. Old code unaffected.
2. **Migrate** — backfill data, dual-write (write to both old and new), then migrate readers one at a time.
3. **Contract** — drop old column / table after all consumers verified migrated. Often a separate PR weeks later.

**API (public or service-to-service)**

1. **Expand** — add new endpoint / field / version alongside old. Old continues to work.
2. **Migrate** — consumers adopt the new endpoint on their schedule. Track adoption.
3. **Contract** — deprecate old endpoint with a window, then remove.

**Internal interface with multiple non-atomic consumers**

1. **Expand** — add new method / signature alongside old.
2. **Migrate** — update call sites incrementally.
3. **Contract** — remove old method after all call sites moved.

### Schemas can't be flagged at the storage layer

A flag wraps code. A flag does not wrap a schema. If you "flag a schema migration," what you're actually flagging is the code that reads/writes the new shape — the schema change itself went out for everyone the moment you ran the migration.

This is why a flagged feature with a schema change uses **both** mechanisms:

- Schema goes expand-contract (it has to — there's no other safe way).
- The reading/writing code sits behind the flag.
- The contract phase (dropping old columns) happens _after_ the flag is 100% on and permanent.

### Anti-patterns

- **In-place destructive schema change behind a flag.** Dropping or renaming a column behind a flag does nothing — the schema is already changed for everyone. Use expand-contract on the schema; flag the consumer.
- **Expand without contract.** "Expand" alone is just accumulation. The contract phase is mandatory, or you accrue forever-debt. Plan it explicitly; don't leave it as "we'll clean up later."
- **Expand-contract when you control everything end-to-end.** If all consumers ship in one PR with you, the expand step is ceremony. Direct change.

## Worked examples

### "Rename `user.fullName` to `user.displayName` across mobile API"

```
Reversibility mechanism: expand-contract alone.
  Surface: API.
  Phases:
    1. Expand: add `displayName` (both fields returned).
    2. Migrate: client teams adopt `displayName` on their schedule.
    3. Contract: deprecate `fullName` after deprecation window; remove.
  Why no flag: migration cadence is the rollout. Each client migrates independently.
                Revert = stop migrating, or restore the field.
```

### "Redesign checkout UI"

```
Mechanism: flag alone.
  No contract changing. New UI alongside old, gated by `new_checkout_enabled`.
  Flag purpose: BOTH — launch (% rollout to de-risk) AND reversibility (critical path).
  Flag system: PostHog (per .tap/architecture.md).
  Gate location: checkout route.
  Lifecycle: short-lived. Remove once 100% rolled out and trusted for 30 days.
  Rollback: flag flip.
```

### "Launch Workflow Templates tab on Pro plan at next Tuesday's announcement"

```
Mechanism: flag alone.
  No contract changing. No critical-path risk (well-tested, additive UI).
  Flag purpose: LAUNCH only — tier-gating (Pro) AND timing (announcement).
  Flag: `workflow_templates_pro` — gates by tier (permanent) AND by date (until launch).
  Flag system: per .tap/architecture.md.
  Gate location: Pro-plan sidebar entry + /templates route.
  Lifecycle: long-lived. Tier gate stays; timing gate self-expires after Tuesday.
  Note: a risk-only planner would conclude "no flag needed" here and miss the launch need entirely.
```

### "Dogfood new search ranking for internal team only, for 3 weeks before customer rollout"

```
Mechanism: flag alone.
  No contract changing. Risk reasoning: untrusted in prod (new ranking algorithm).
  Flag purpose: BOTH — launch (audience gate: internal-only) AND reversibility (untrusted).
  Flag: `new_search_ranking` — `is_internal_user` cohort initially, then expand by %.
  Lifecycle: short-lived. Removed once rolled out to 100% and trusted.
```

### "Move payments to a new processor"

```
Reversibility mechanism: both.
  Expand-contract on schema:
    1. Add new `payments_v2` table.
    2. Dual-write to old + new.
    3. Migrate readers to v2.
    4. Drop `payments_v1` (after flag permanent).
  Flag (`new_processor_enabled`) on user-facing cutover:
    Old processor remains callable until flag flips for each cohort.
  Why flag on top: user-visible behavior + uncertain prod behavior of new processor
                   + need fast rollback if the new processor errors.
```

### "Add a new GET /api/users/preferences endpoint, no existing consumers"

```
Reversibility mechanism: neither.
  No contract changing (additive). No user-visible cutover. Ships dark.
  Rollback: revert.
```

### "Bug fix: cart count shows stale value after item removal"

```
Reversibility mechanism: neither.
  Bug fix — ships to everyone immediately. Flagging a bug fix is malpractice.
  Rollback: revert if it introduces a regression.
```

## Net behavior to optimize for

A planner using this skill should produce, for most changes:

- **Most small additive work, no launch coordination:** "neither, direct deploy."
- **Most contract evolution:** "expand-contract alone, the migration is the rollout."
- **Most feature work that's risky OR needs launch control** (cohort, tier, timing, %-rollout, A/B): "flag alone."
- **Reserved for genuinely large risky shifts with contract change:** "both."

The wrong outcomes:

- Planner defaults to "flag it" on every change → ceremony.
- Planner stacks expand-contract + flag whenever both could conceivably apply → ceremony.
- Planner concludes "no risk = no flag" on a feature that needs cohort/tier/timing control → misses the launch need.

The right outcome: **the lightest mechanism that produces the reversibility AND launch control actually needed.** Flags serve two purposes — launch and reversibility — and either justifies one. Don't conflate them, don't fragment a feature across multiple flags.
