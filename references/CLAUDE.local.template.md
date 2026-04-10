# Local Development Preferences

## Workflow: Think Before Building

When I bring a feature, problem, or idea — before jumping to code:

1. **Loop check** (new repo or unfamiliar area): Run `/dev-skills:loop-check` to see what's missing for autonomous iteration.
2. **Auto-route based on readiness**:
   - Check `thoughts/plans/` and `thoughts/research/` for existing artifacts matching the topic
   - **Plan exists** → skip to implementation, the plan is source of truth
   - **Research exists but no plan** → `/dev-skills:implementation-planning`
   - **Nothing exists + fuzzy/ambiguous** → `/dev-skills:product-thinker` first (will offer shaping handoff with context passthrough), then plan
   - **Nothing exists + clear and small** → implement directly
   - **Nothing exists + clear but medium/large** → `/dev-skills:implementation-planning`
3. **STOP before implementing medium/large work** — present the plan and wait for my confirmation before writing code.
4. **Verify after implementing** — run `/dev-skills:qa-test` for UI changes, or run the relevant test suite for backend changes.

Skip this workflow only when I explicitly say "just do it" or give a precise, scoped instruction (e.g., "rename X to Y").

## Git

Never force push. When a force push is absolutely necessary (e.g. after rebase), use `--force-with-lease` on a feature branch only — never on main.

Always run `git add`, `git commit`, and `git push` as separate commands — never chain them with `&&`.
