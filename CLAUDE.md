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
- Mods read skill output — keep the contracts in [teambrilliant/claude-code-mods `CONTRACTS.md`](https://github.com/teambrilliant/claude-code-mods/blob/main/CONTRACTS.md) when editing skills: every ★ block opens `★ <Kind> ─────` and closes `───── ★` (short bars); every plan Phase Check item starts with its command in backticks; execute-plan ticks `- [x]` right after each check passes
- QA evidence (failure screenshots only) goes in `./qa-evidence/`
- Skills use sub-agents for context-heavy work (browser testing, codebase research) to keep main thread lean

## When editing skills

- Keep skill descriptions concise — they're loaded into context on every invocation
- Trigger phrases in `description` field drive auto-detection; be specific
- Reference files are for templates/examples too large for the main SKILL.md
- Test skill changes by invoking them (`/dev-skills:skill-name`) in a real project

