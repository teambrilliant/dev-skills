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
primitives → shape → plan → implement → QA
    0          1       2       3        4
```

Skills map to stages: `product-primitives` (0), `shaping-work` (1), `product-thinker` (0-1), `implementation-planning` (2), `implement-change` (3), `qa-test` (4).

## Conventions

- Plugin manifest: `.claude-plugin/plugin.json` — bump version on behavioral changes
- Persistent docs go in `thoughts/research/` or `thoughts/plans/` with `YYYY-MM-DD` prefix, hyphens in filenames
- QA evidence (failure screenshots only) goes in `./qa-evidence/`
- Skills use sub-agents for context-heavy work (browser testing, codebase research) to keep main thread lean

## When editing skills

- Keep skill descriptions concise — they're loaded into context on every invocation
- Trigger phrases in `description` field drive auto-detection; be specific
- Reference files are for templates/examples too large for the main SKILL.md
- Test skill changes by invoking them (`/dev-skills:skill-name`) in a real project
