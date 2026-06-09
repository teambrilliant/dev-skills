---
name: implementation-planning
description: >-
  Create technical implementation plans and architecture designs. Use when someone needs a detailed
  technical approach before coding begins — "create a plan", "plan this ticket", "how should we
  implement this", "technical design", "architect this", "design the approach", "plan the migration",
  "refactor plan", "how should we structure this", or when shaped work or a groomed ticket needs
  a concrete implementation strategy with phases, file changes, and verification steps.
---

# Implementation Planning

Take a ticket, shaped work, or technical challenge and create a detailed implementation plan that any developer or agent can follow.

## Workflow

Every plan follows the same arc, regardless of which agent or harness runs it: **research → validate → write → present**.

1. **Research** the codebase until grounded — mandatory, never plan from assumptions (see Process below).
2. **Write** the plan to `thoughts/plans/YYYY-MM-DD-descriptive-name.md` — the persistent, shareable location. Use TODAY'S DATE from context as the prefix.
3. **Present** it for approval before any code is written, then close with the ★ Plan View block (see Plan View below).

If your harness has a plan/preview mode that gates editing until you approve, use it — otherwise present the plan inline. Either way, always write the persistent `thoughts/plans/` file, even if the harness keeps its own temporary plan doc. The gate is the approval, not the mode.

## Design Philosophy

Before writing plans, read [references/software-design-philosophy.md](references/software-design-philosophy.md). Apply these principles when designing module boundaries, interfaces, and decomposition. Key checks: modules should be deep, information hiding, define errors out of existence, design it twice.

## Rollout & Rollback

Every plan must specify how the change ships and to whom. Read [references/rollout-primitives.md](references/rollout-primitives.md) before writing the plan and walk the three decision questions:

1. **Contract test:** is a shared contract changing? (schema, public API, multi-consumer interface) → plan expand-contract on the affected surface.
2. **Launch-strategy test:** who should see this, and when? Cohort, tier, geo, timing, %-rollout, A/B, dogfooding → flag (launch flag).
3. **Kill-switch test:** if this went bad in prod, what would I do? Flip a flag → flag (risk flag). Revert + redeploy is fine → no risk flag.

Flags serve two purposes — **launch control** (who/when) and **reversibility** (turn-off). Either test saying "flag" justifies one. Same flag covers both if both apply.

Default is **no flag, no expand-contract**. Pick the lightest mechanism(s) that produce the launch control AND reversibility actually needed. One flag per feature (at the user-visible boundary), never one flag per phase. Bug fixes never get flags. The flag system itself is discovered from `.tap/architecture.md` or by grepping known imports — do not invent one.

## Principles

- **Research first** — understand the codebase before proposing solutions
- **Be specific** — include file paths, function names, code snippets
- **Be skeptical** — question assumptions, identify risks early
- **Decide, don't ask** — every open question gets a recommended resolution with reasoning. Never present a question without proposing what you'd do
- **Be practical** — focus on incremental, testable changes
- **Agent-agnostic** — plan should work for any implementer
- **Follow patterns** — match existing codebase conventions

## Process

### 1. Research (mandatory — depth scales to blast radius)

Never plan from assumptions. Ground every plan in the actual codebase before writing it. Cover all four goals below; how deep you go scales with the change's blast radius — a one-file change gets a quick pass, a cross-package feature gets the full sweep.

- **LOCATE** — where the relevant files live (routes, business logic, components, schema, tests). Map locations, don't read everything.
- **PATTERNS** — how similar things are already done here. Extract complete examples with imports; note naming, file organization, error handling.
- **ANALYZE** — trace the relevant path end-to-end (entry point → data/API), mapping key functions and their inputs/outputs.
- **VALIDATE** — confirm the premises the plan rests on. When the plan depends on runtime or data facts ("X drives Y", "this field is always set"), check the live data/behavior — don't infer it from static code. A wrong premise produces a wrong plan.

If your harness supports sub-agents, fan these out in parallel for speed — one per goal. If it doesn't, work through them inline with your codebase-search tools. The requirement is the four outcomes, not the mechanism.

**Also gather:**
- Related research docs in `thoughts/research/`
- The tech stack:

```markdown
**Package manager:** pnpm/npm/yarn
**Build tool:** turbo/nx/none
**Language:** TypeScript (strict mode?)
**Runtime:** Node.js/Bun/Deno
**Framework:** Fastify/Express/Hono
**Database:** Postgres + Drizzle/Prisma
**Testing:** Vitest/Jest
**Patterns to follow:** [reference existing implementations]
```

**For monorepo projects:**
- Package structure from `pnpm-workspace.yaml`
- Build configuration from `turbo.json`
- Existing packages for patterns to follow

Ask clarifying questions if requirements are ambiguous.

### 2. Present Options (If Multiple Approaches Exist)

Present trade-offs clearly:
- Option A: [approach] — Pros/Cons
- Option B: [approach] — Pros/Cons
- Recommendation: [which and why]

Get alignment before detailed planning.

### 3. Write the Plan

Create a structured plan following the output format below.

## Output Format

```markdown
# [Title] - Implementation Plan

## Overview
[1-2 sentences: what we're building and why]

## Acceptance Criteria
[Link to the shape doc: `thoughts/research/YYYY-MM-DD-name.md`]
[The shape doc is the canonical source. Do NOT restate or reinterpret criteria here — qa-test will consume them from the shape doc verbatim.]
[If no shape exists (tiny/unshaped work), list criteria here directly using the same rules as shaping-work: independently testable, observable behavior, no vague language.]

## Current State
[What exists now, what's missing, relevant code locations]

## Desired End State
[What should work when done, how to verify — include example commands/usage]

## Out of Scope
[Explicitly list what we're NOT doing — prevents scope creep]

## Rollout & Rollback

**Reversibility mechanism:** [expand-contract / flag / both / neither — walk the decision tree in [references/rollout-primitives.md](references/rollout-primitives.md)]

**If expand-contract:**
- Surface: [schema / API / interface]
- Phases: expand → migrate → contract (each is a separate plan phase, not lumped together)
- Why no flag (if applicable): migration cadence is the rollout; each step independently reversible
- Why flag on top (if applicable): [user-visible cutover / uncertain prod behavior / fast atomic rollback need]

**If flag (standalone or on top):**
- Flag name: [one flag for the whole feature, e.g., `feature_x_enabled`]
- Flag purpose: [launch control / reversibility / both]
- Flag system: [from `.tap/architecture.md`, or grep result, or "no flag infra detected — see below"]
- Gate location: [the user-perceived entrypoint — UI route, CTA, public API method]
- Lifecycle: [short-lived (remove once trusted / launched — schedule a removal task) / long-lived (permanent entitlement, geo, or segmentation gate)]
- Rollback lever: flag flip

**If neither:**
- Direct deploy. Blast radius: [scope]. Rollback: revert + redeploy.

**If no flag infra exists and flag is needed:** flag infra is a prerequisite — note this explicitly; do not invent a system mid-plan.

## Implementation Approach
[High-level strategy and reasoning]

---

## Phase 1: [Descriptive Name]

### What This Accomplishes
[Summary of this phase's goal]

### Changes

**File**: `path/to/file.ext`

```[language]
// Complete code to add or modify
// Not snippets — full implementation
```

**File**: `path/to/another.ext`

```[language]
// Complete code
```

### Phase Checks
- [ ] [Specific command to run — build, typecheck, unit test]
- [ ] [Expected output or behavior]

*Phase Checks are technical gates (build passes, typecheck clean, unit tests green). They are NOT acceptance criteria. ACs are verified by qa-test at the end against the shape doc.*

---

## Phase 2: [Descriptive Name]
[Same structure as Phase 1]

---

## Testing Strategy

### Manual Verification
```bash
# Step-by-step commands to verify everything works
command1
command2
```

### Automated (if applicable)
- [ ] Unit tests: [what to test]
- [ ] Integration tests: [what scenarios]

## File Summary
```
directory/
├── file1.ext           # Purpose
├── file2.ext           # Purpose
└── subdirectory/
    └── file3.ext       # Purpose
```

**Total new files:** N files

## Related Research
- `thoughts/research/YYYY-MM-DD-name.md` — [what it covers]

## Open Questions

Every question includes a recommended resolution. Proceeding with these unless you steer otherwise.

- **[Question]**
  Recommend: [option] — [why]
  Discarded: [option] ([why not])
```

## Plan View — signature block (always close with this)

After writing the plan to file, close your response with a **★ Plan View** block: a short summary, then an ASCII map of the plan's structure. This is the default — the user shouldn't have to ask for an ASCII explanation. It's the at-a-glance view; the file holds the detail.

The ASCII is a structural **map**, not a re-render of the plan body — show phases in sequence, the files each touches, dependencies between phases, and the verification gate per phase. Nothing else.

```
★ Plan View ─────────────────────────────────────
- Building: [what, one line]
- Approach: [the strategy, one line]
- Blast radius: [N files / surfaces]  ·  Rollout: [flag / expand-contract / direct]
- Risk: [the thing most likely to bite]
──────────────────────────────────────────────────

Plan: [title]
│
├─ Phase 1: [name]
│    ├─ path/to/file.ext
│    └─ ✓ [phase check]
├─ Phase 2: [name]            (depends on P1)
│    ├─ path/to/other.ext
│    └─ ✓ [check]
└─ Phase 3: [name]
     └─ ✓ [check]

Full plan → thoughts/plans/YYYY-MM-DD-name.md
```

Rules:
- Block leads the closing response — consistent with `product-thinker` (★ Product View), `shaping-work` (★ Shaped View), `strategic-thinker` (★ Strategic View)
- Summary bullets are assertions, not hedges
- ASCII shows structure only — never duplicate the markdown body

## Phase Guidelines

**Good phases:**
- Each phase is independently verifiable via Phase Checks
- Earlier phases don't break existing functionality
- Later phases build on earlier ones
- Can pause between phases if needed

**Phase sizing:**
- Small enough to verify quickly
- Large enough to be meaningful
- Typically 1-3 files per phase
- Each phase should have clear verification steps

**Code in phases:**
- Include COMPLETE code, not snippets
- Show the full file content or the full function
- Never use "..." or "// rest of code"
- Someone should be able to copy-paste and have it work

## What Makes a Good Plan

**Good** (specific, actionable):
- File paths exist or clearly describe where to create
- Code snippets show COMPLETE implementation
- Verification steps are concrete commands
- Expected outputs documented

**Bad** (vague, hand-wavy):
- "Update the relevant components"
- "Add appropriate error handling"
- "Test thoroughly"
- Code snippets with "..." placeholders

## Example

**Input ticket**: "Add database package with Drizzle ORM"

**Output plan** (abbreviated):

```markdown
# Database Package - Implementation Plan

## Overview
Create `packages/db` with Drizzle ORM for PostgreSQL, following monorepo patterns from jp-partner-platform.

## Current State
- Monorepo exists with Fastify API + Temporal worker
- Postgres in docker-compose (port 5462)
- No database package yet

## Desired End State
```bash
# Package builds successfully
pnpm --filter=@repo/db build

# Migrations work
pnpm --filter=@repo/db generate
pnpm --filter=@repo/db migrate

# Types available in other packages
import { users } from "@repo/db/schema"
```

## Out of Scope
- API endpoints using the database
- Seed data
- Production deployment config

---

## Phase 1: Package Setup

### What This Accomplishes
Create the package skeleton with Drizzle configuration.

### Changes

**File**: `packages/db/package.json`
```json
{
  "name": "@repo/db",
  "type": "module",
  "exports": {
    ".": { "default": "./dist/index.js" },
    "./schema": { "default": "./dist/schema/index.js" }
  },
  "scripts": {
    "build": "tsc",
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "drizzle-orm": "^0.44.0",
    "postgres": "^3.4.7"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.0"
  }
}
```

**File**: `packages/db/drizzle.config.ts`
```typescript
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5462/mydb",
  },
})
```

### Phase Checks
- [ ] `pnpm install` succeeds
- [ ] `pnpm --filter=@repo/db build` succeeds

---

## Phase 2: Schema Definition
[...]
```

## Handoffs

- After plan approval, use `/dev-skills:implement-change` to execute phase by phase
- The plan in `thoughts/plans/` serves as the source of truth during implementation
