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
| product-primitives      | `/dev-skills:product-primitives`      | System → fundamental primitives & building blocks |
| shaping-work            | `/dev-skills:shaping-work`            | Rough idea → structured work definition     |
| product-thinker         | `/dev-skills:product-thinker`         | Product decisions, UX analysis, build-vs-buy |
| implementation-planning | `/dev-skills:implementation-planning` | Ticket → technical implementation plan      |
| implement-change        | `/dev-skills:implement-change`        | Plan → working code, phase by phase         |
| qa-test                 | `/dev-skills:qa-test`                 | Browser-based QA verification via sub-agent  |

## Typical flow

```
primitives → shape → plan → implement → QA
     0          1       2       3        4
```

0. `/dev-skills:product-primitives` — break system into deep, composable primitives
1. `/dev-skills:shaping-work` — define what to build (features, bugs, improvements)
2. `/dev-skills:implementation-planning` — design how to build it
3. `/dev-skills:implement-change` — build it phase by phase
4. `/dev-skills:qa-test` — verify in browser
