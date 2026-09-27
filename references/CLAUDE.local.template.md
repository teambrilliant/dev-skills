# Local Development Preferences

## Workflow: Think Before Building

When I bring a feature, problem, or idea — before jumping to code:

1. **Loop check** (new repo or unfamiliar area): Run `/tap-skills:loop-check` to see what's missing for autonomous iteration.
2. **Auto-route based on readiness**:
   - Check `thoughts/plans/`, `thoughts/shapes/`, and `thoughts/research/` for existing artifacts matching the topic
   - **Plan exists** → skip to implementation, the plan is source of truth
   - **Shape or research exists but no plan** → `/dev-skills:write-plan`
   - **Nothing exists + fuzzy/ambiguous** → `/dev-skills:product-thinker` first (will offer shaping handoff with context passthrough), then plan
   - **Nothing exists + clear and small** → implement directly
   - **Nothing exists + clear but medium/large** → `/dev-skills:write-plan`
3. **STOP before implementing medium/large work** — present the plan and wait for my confirmation before writing code.
4. **Execute to the contract** — once a plan is approved, `/dev-skills:execute-plan` runs every phase, runs the test suite and `/dev-skills:qa-test` itself, and ends DONE or BLOCKED. No check-ins between phases.
5. **Customer-facing work** — make sure I can explain and defend it: `/dev-skills:explain` on the plan or the shipped diff.

Open questions must include a recommended resolution with reasoning. Never ask "what do you want?" — propose what you'd do and why, with discarded alternatives. I'll steer if I disagree.

Skip this workflow only when I explicitly say "just do it" or give a precise, scoped instruction (e.g., "rename X to Y").

## Git

Never force push. When a force push is absolutely necessary (e.g. after rebase), use `--force-with-lease` on a feature branch only — never on main.

Always run `git add`, `git commit`, and `git push` as separate commands — never chain them with `&&`.
