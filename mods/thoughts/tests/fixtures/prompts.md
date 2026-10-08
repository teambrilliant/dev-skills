# Headless fixture prompts (Phase 1 check)

Self-contained prompts, one per skill — answerable without exploring a codebase.

- product-thinker: Should a todo app for solo freelancers add a recurring-invoice reminder? No codebase; answer from product reasoning only.
- strategic-thinker: Should a 3-person team split a Rails monolith into services this quarter? No codebase; reason from the tradeoffs only.
- shaping-work: Idea: let users export their saved searches as CSV. Shape it. No codebase; do not write files, reply inline.
- working-backwards: Idea: a browser extension that summarizes long GitHub PR threads. Write the PR-FAQ inline; do not write files.
- write-plan: Plan adding a `--json` flag to a CLI that prints `hello`. Assume a single file `cli.ts`; do not research, do not write files — reply with the plan inline.
- explain: Explain this inline: a cron job reads `orders` rows with status `pending`, calls Stripe to charge each, and sets status `paid` or `failed`.
