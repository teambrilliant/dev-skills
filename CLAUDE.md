# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Claude Code plugin (`dev-skills`) packaging development workflow skills. Skills are pure markdown — no build, no tests, no compilation.

## Skill structure

Each skill lives at `skills/<name>/SKILL.md` with optional `references/` subdirectory.

SKILL.md format:
```yaml
---
name: kebab-case-name          # invoked as /dev-skills:name
description: what + triggers   # trigger phrases for auto-detection
allowed-tools: [...]           # optional, if skill needs specific tools
---
```

Body: process steps, patterns, output format, templates.

## Workflow stages

```
primitives → shape → plan → execute → QA
    0          1       2       3       4
```

Skills map to stages: `product-primitives` (0), `shaping-work` (1), `product-thinker` (0-1), `strategic-thinker` (0 to 2), `write-plan` (2), `execute-plan` (3), `qa-test` (4), `explain` (any stage). Harness meta-skills `loop-check` and `tighten-loop` now live in `tap-skills`.

## Conventions

- Plugin manifest: `.claude-plugin/plugin.json` — bump version on behavioral changes
- Persistent docs go in `thoughts/shapes/` (shaping-work), `thoughts/plans/` (write-plan), or `thoughts/research/` (discovery, investigations) with `YYYY-MM-DD` prefix, hyphens in filenames
- Persist only what the harness executes against (shapes, plans, research). Views (★ blocks) and explanations are session-scoped — re-derived when their source changes, never written to `thoughts/`
- Contracts read by `mods/thoughts` — keep them when editing skills: every ★ block closes with a line ending `─── ★`; every plan Phase Check item starts with its command in backticks; execute-plan ticks `- [x]` right after each check passes
- QA evidence (failure screenshots only) goes in `./qa-evidence/`
- Skills use sub-agents for context-heavy work (browser testing, codebase research) to keep main thread lean

## When editing skills

- Keep skill descriptions concise — they're loaded into context on every invocation
- Trigger phrases in `description` field drive auto-detection; be specific
- Reference files are for templates/examples too large for the main SKILL.md
- Test skill changes by invoking them (`/dev-skills:skill-name`) in a real project

## Mods

Claude Code mods (function-hook plugins, early-access API) live in `mods/<name>/`: `.claude-plugin/plugin.json`, `hooks/hooks.json` → `hooks/register.tsx`, `types/index.d.ts` (the `$.state` contract), `tests/*.test.ts(x)`. Not part of the dev-skills plugin; load one with `~/.local/bin/claude --plugin-dir mods/<name>`.

- Always call `~/.local/bin/claude` — the shell alias `claude --channels …` swallows `plugin` subcommands.
- Loop: `~/.local/bin/claude plugin test mods/<name>` · `~/.local/bin/claude plugin validate mods/<name>` · `cd mods/<name> && bunx tsc -p .`
- tsc reads the API from `.claude-plugin/types/` (gitignored). The engine writes it there whenever it loads the mod; before the first load, copy the plugin-authoring skill's `types/claude-code.d.ts` to `.claude-plugin/types/claude-code/index.d.ts`.
- The test kit has no fs: fixtures are generated into `tests/fixtures/fixtures.gen.ts` (`bun mods/thoughts/scripts/build-fixtures.ts`).
- The kit can't answer `session.append` (it requires `next`, and nothing sits beneath it in a test), so test the logic behind that hook through another entry point.
- If the kit says hooks modules are turned off ("rollout switch"), run it once with network access.
