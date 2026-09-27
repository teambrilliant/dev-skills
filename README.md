# dev-skills

Generic development workflow skills for Claude Code. Break down, shape, plan, implement, verify.

## Install

```
/plugin marketplace add teambrilliant/marketplace
/plugin install dev-skills@teambrilliant
```

## Skills

| Skill              | Invoke                           | What it does                                                   |
| ------------------ | -------------------------------- | -------------------------------------------------------------- |
| product-primitives | `/dev-skills:product-primitives` | System → fundamental primitives & building blocks              |
| product-thinker    | `/dev-skills:product-thinker`    | Product decisions, UX analysis, build-vs-buy                   |
| product-discovery  | `/dev-skills:product-discovery`  | Validate ideas before committing to build                      |
| working-backwards  | `/dev-skills:working-backwards`  | PR-FAQ to pressure-test an idea customer-first                 |
| strategic-thinker  | `/dev-skills:strategic-thinker`  | Approach selection, tradeoffs, sanity checks                   |
| shaping-work       | `/dev-skills:shaping-work`       | Rough idea → shape in `thoughts/shapes/`                       |
| write-plan         | `/dev-skills:write-plan`         | Shape/ticket → plan in `thoughts/plans/` (layers, checks)       |
| execute-plan       | `/dev-skills:execute-plan`       | Plan → verified code; ends DONE or BLOCKED, no check-ins       |
| qa-test            | `/dev-skills:qa-test`            | Browser-based acceptance-criteria verification via sub-agent   |
| explain            | `/dev-skills:explain`            | ASCII + plain words: understand and defend a plan or change    |

> Repo feedback-loop assessment (`loop-check`) and session debrief (`tighten-loop`) now live in [`tap-skills`](https://github.com/teambrilliant/tap-skills), invoked as `/tap-skills:loop-check` and `/tap-skills:tighten-loop`.

## Typical flow

```
primitives → discovery → shape → plan → execute → QA
   0            1          2       3       4       5
                      product-thinker        explain (any time)
                         (0-2)
```

0. `/dev-skills:product-primitives` — break system into deep, composable primitives
1. `/dev-skills:product-discovery` — validate whether an idea is worth building (4 risks, experiments, evidence gates)
2. `/dev-skills:shaping-work` — define what to build → `thoughts/shapes/`
3. `/dev-skills:write-plan` — design how to build it, layer by layer → `thoughts/plans/`
4. `/dev-skills:execute-plan` — build it to the contract: DONE or BLOCKED, verification included
5. `/dev-skills:qa-test` — verify in browser (execute-plan runs it for UI criteria)

`/dev-skills:product-thinker` pairs with stages 0-2. `/dev-skills:explain` works at any point — on the last message, a shape, a plan, or a shipped diff — and for customer-facing work answers the questions a lead will ask (why this, abuse, data shape, failure).

### Working docs

```
thoughts/
  shapes/    shaping-work output
  plans/     write-plan output
  research/  discovery and investigations
```

Branch-local working context — not committed by default.

## Rollout & Rollback (continuous delivery primitives)

Cross-cutting across `shaping-work`, `write-plan`, `strategic-thinker`, and `execute-plan`. The reference doc at [`skills/write-plan/references/rollout-primitives.md`](skills/write-plan/references/rollout-primitives.md) defines two mechanisms and three decisions.

**Two mechanisms:**

- **Expand-contract** — evolve a shared contract (DB schema, public API, multi-consumer interface) safely by shipping additive changes first, migrating consumers, then removing the old path. The migration cadence IS the rollout.
- **Feature flag** — wraps a user-visible code path. Serves two purposes (either justifies a flag):
  - **Launch control** — cohort, tier, geo, timing, %-rollout, A/B, dogfooding
  - **Reversibility** — kill-switch for critical-path / uncertain / risky changes

**Three decisions (every plan walks this tree):**

1. **Contract test** — is a shared contract changing? → expand-contract.
2. **Launch-strategy test** — who should see this, and when? → flag (launch flag).
3. **Kill-switch test** — if bad in prod, what would I do? → flag (risk flag).

Default is **no flag, no expand-contract**. Pick the lightest mechanism(s) that produce the launch control AND reversibility actually needed. One flag per feature, at the user-visible boundary. Bug fixes never get flags. Schemas can't be flagged — flag the consumer, expand-contract the schema.

**Integration with tap-skills:** the flag system itself (PostHog / LaunchDarkly / static config / DB-driven / none) is discovered from `.tap/architecture.md`, which [`tap-skills:tap-audit`](https://github.com/teambrilliant/tap-skills) seeds during repo audit. Planners read it; they don't re-derive it on every plan.

## Workflow automation

Copy the template into any repo to get the full skill chain with smart routing:

```bash
cp "$(claude plugin path dev-skills)/references/CLAUDE.local.template.md" ./CLAUDE.local.md
```

This gives you:
- Auto-routing based on existing artifacts (plans, research docs)
- Product thinking only when requirements are fuzzy
- Mandatory review gate before medium/large implementation
- QA verification after implementation

Then add project-specific sections (dev server, database, tools) below the workflow block.
