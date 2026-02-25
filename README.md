# dev-skills

Generic development workflow skills for Claude Code. Shape, plan, implement, verify.

## Install

```
/plugin marketplace add teambrilliant/marketplace
/plugin install dev-skills@teambrilliant
```

## Skills

| Skill                   | Invoke                                | What it does                                |
| ----------------------- | ------------------------------------- | ------------------------------------------- |
| shaping-work            | `/dev-skills:shaping-work`            | Rough idea → structured work definition     |
| product-thinker         | `/dev-skills:product-thinker`         | Product analysis, UX review, prioritization |
| implementation-planning | `/dev-skills:implementation-planning` | Ticket → technical implementation plan      |
| implement-change        | `/dev-skills:implement-change`        | Plan/ticket → working code                  |
| qa-test                 | `/dev-skills:qa-test`                 | Browser-based QA verification               |

## Typical flow

```
shape → plan → implement → QA
  1        2       3        4
```

1. `/dev-skills:shaping-work` — define what to build
2. `/dev-skills:implementation-planning` — plan how to build it
3. `/dev-skills:implement-change` — build it
4. `/dev-skills:qa-test` — verify in browser
