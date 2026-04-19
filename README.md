# dev-skills

Generic development workflow skills for Claude Code. Break down, shape, plan, implement, verify.

## Install

```
/plugin marketplace add teambrilliant/marketplace
/plugin install dev-skills@teambrilliant
```

## Skills

| Skill                   | Invoke                                | What it does                                |
| ----------------------- | ------------------------------------- | ------------------------------------------- |
| loop-check              | `/dev-skills:loop-check`              | Assess what's needed for autonomous feedback loops |
| product-primitives      | `/dev-skills:product-primitives`      | System → fundamental primitives & building blocks |
| shaping-work            | `/dev-skills:shaping-work`            | Rough idea → structured work definition     |
| product-thinker         | `/dev-skills:product-thinker`         | Product decisions, UX analysis, build-vs-buy |
| product-discovery       | `/dev-skills:product-discovery`       | Validate ideas before committing to build    |
| implementation-planning | `/dev-skills:implementation-planning` | Ticket → technical implementation plan      |
| implement-change        | `/dev-skills:implement-change`        | Plan → working code, phase by phase         |
| qa-test                 | `/dev-skills:qa-test`                 | Browser-based QA verification via sub-agent  |
| design-language         | `/dev-skills:design-language`         | Capture + enforce a product's visual design language |

## Typical flow

```
loop-check → primitives → discovery → shape → plan → implement → QA
   -1            0            1          2       3       4        5
                      product-thinker
                         (0-2)
                      design-language
                         (2-5, cross-cutting)
```

-1. `/dev-skills:loop-check` — assess what's needed for autonomous feedback loops
0. `/dev-skills:product-primitives` — break system into deep, composable primitives
1. `/dev-skills:product-discovery` — validate whether an idea is worth building (4 risks, experiments, evidence gates)
2. `/dev-skills:shaping-work` — define what to build (features, bugs, improvements)
3. `/dev-skills:implementation-planning` — design how to build it
4. `/dev-skills:implement-change` — build it phase by phase
5. `/dev-skills:qa-test` — verify in browser

`/dev-skills:product-thinker` pairs with stages 0-2 — product decisions, UX analysis, build-vs-buy evaluation.

`/dev-skills:design-language` is cross-cutting across stages 2-5 — captures design inspiration into a living `docs/design.md`, checks implementations for drift, pairs with shape / plan / implement / QA.

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
