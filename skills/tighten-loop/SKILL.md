---
name: tighten-loop
description: >-
  Harvest course-corrections from the current conversation and convert them into durable
  fixes so the agent doesn't need the same steer next time. Use when someone says "tighten
  the loop", "tighten loop", "debrief this session", "session debrief", "what should I update
  so next time you don't…", "how can I make your life easier", "what tripped you up", "what
  slowed you down", or at the end of a session when the user reflects on agent friction. The
  scope marker is THIS SESSION / THIS CONVERSATION — that's the discriminator from sibling
  skills. Reads the transcript only, classifies each steer, routes to the right fix tool.
  NOT for: assessing repo readiness before work (use loop-check), retros on past
  PRs/incidents/releases (use tap-skills:retrospective), coding, or applying edits inline.
---

# Tighten Loop

Answer one question: **"From the corrections I gave the agent in this conversation, what should I update so it doesn't need them next time?"**

Read the transcript. Find the steers. Classify the gap. Route to the right fix tool. Don't make the edits yourself — hand off.

## Process

1. Harvest steers from the transcript
2. Classify each by gap type
3. Route each to the right fix tool
4. Present findings and offer handoffs
5. Optionally append to `.tap/learnings.md`

### 1. Harvest Steers

Scan the conversation for moments where the user redirected the agent. Look for:

- **Corrections** — "no", "stop", "don't", "instead", "actually", "that's wrong", "not like that", "I told you to…"
- **Standing rules** — "always do X", "never do Y", "from now on…", "going forward…"
- **Validated judgment calls** — when the user accepts a non-obvious choice without pushback, or says "yes exactly that" / "perfect, keep doing it that way". These are easy to miss because they're quiet, but capturing them prevents drift in future sessions.
- **Repeated friction** — when the user had to remind the agent of the same thing twice, that's the strongest signal. Flag explicitly.

Skip: tactical exchanges that are normal conversation flow ("can you also add X"), or one-off task pivots that don't generalize. Also filter out steers about *personal orchestration style* (how the user wants the agent to orchestrate for them) — those are out of scope for repo-portable fixes.

If the harvest is thin (≤2 steers) or empty after filtering, say so honestly. An empty harvest on a low-friction or personal-context session is a correct outcome, not a failure — don't pad with weak findings to fill the signature block.

### 2. Classify by Gap Type

Same taxonomy as `tap-skills:retrospective`, so the two skills' outputs are interchangeable:

| Gap | Agent lacked… | Examples |
|---|---|---|
| **Context** | Information | Project convention not in CLAUDE.md, missing ADR, undocumented domain rule, working-style rule that should be durable |
| **Harness** | Tools or access | Missing MCP, missing CLI, missing skill, permission re-prompts |
| **Feedback** | A way to verify | No tests for the area, no browser QA, no type check catching the failure |
| **Scope** | Boundaries | Took on architectural decision that needed human judgment, ambiguous task |

tighten-loop only routes to **repo-portable fixes** — files that live in the project and travel with it (CLAUDE.md, AGENTS.md, `.claude/settings.json`, hooks, skills). It does not route to harness-local memory or personal global config: those don't help teammates, don't survive a harness change, and defeat the purpose of harvesting durable improvements. If a steer is genuinely personal-preference-only, surface it but recommend the user capture it themselves — out of scope for this skill.

### 3. Route to an Intent Kind

Each finding routes to one **intent kind** — the canonical action the fix represents. Intent kinds are harness-agnostic so this skill works inside any orchestrator: the *what* is stable, the *how* is the harness's call. The right column shows Claude Code implementations as a default; another harness can translate (e.g., `project-instruction` becomes a memory tool call instead of a CLAUDE.md edit).

| Intent | What it means | Claude Code impl |
|---|---|---|
| `project-instruction` | Durable rule the agent should follow in this repo, including scope/boundary rules | `claude-md-management:claude-md-improver` (CLAUDE.md or AGENTS.md) |
| `agent-config` | Harness behavior change — hooks, permissions, env | `update-config` (.claude/settings.json); `fewer-permission-prompts` for re-prompts |
| `tool-install` | Missing capability — MCP server, CLI, API access | suggest install; name the specific tool |
| `new-skill` | Repeated multi-step task that should become reusable | `skill-creator` — name the skill, sketch what it does |
| `skill-update` | Existing skill in this plugin/repo needs adjustment based on observed friction | edit `skills/<name>/SKILL.md` directly, or `skill-creator` for larger changes |
| `test-coverage` | Missing verification path | suggest test or browser-QA scaffolding; sometimes a PostToolUse hook via `update-config` |

Default gap → intent mapping:
- Context → `project-instruction`
- Harness → `agent-config` / `tool-install` / `new-skill` / `skill-update`
- Feedback → `test-coverage`
- Scope → `project-instruction` (boundary rule)

`skill-update` is worth flagging specifically: if a steer reveals that an existing skill produced the wrong behavior or missed a case, that's a skill-update finding — not a new project-instruction. Fix the skill, not the rules around it.

Be specific in the fix content: name the exact rule, hook, or skill change. "Add a CLAUDE.md rule" is useless; "Add to project CLAUDE.md under Testing: 'Integration tests must hit a real database, not mocks'" is actionable. Same for skill-update: name the skill and the exact paragraph or behavior to change.

### 4. Present Findings

Open with the signature block:

```
`★ Tighten Loop ──────────────────────────────────`
[N] steers harvested — [N context] / [N harness] / [N feedback] / [N scope]
  ├─ [most impactful finding]
  ├─ [second]
  └─ [top recommended fix]
`─────────────────────────────────────────────────`
```

Then present each steer in a table. Lead with the highest-leverage findings — the ones that would prevent the most repeated friction. Mark repeats explicitly:

| # | Steer (paraphrased) | Gap | Intent | Concrete fix |
|---|---|---|---|---|
| 1 | "tests must hit real DB, not mocks" (×2) | context | `project-instruction` | CLAUDE.md under Testing: "Integration tests must hit a real DB, not mocks" |
| 2 | "tighten-loop should report empty harvests honestly" | context | `skill-update` | Edit `skills/tighten-loop/SKILL.md` step 1 — add explicit empty-harvest guidance |
| 3 | permission re-prompt on `bun run` | harness | `agent-config` | Add `Bash(bun run:*)` to `.claude/settings.json` permissions |

After the table, offer handoffs as a numbered list. Let the user pick which fixes to apply now, skip, or defer. Don't apply anything without confirmation — the value of this skill is converging on the *right* durable change, not racing to write one.

If the orchestrator (or user) asked for findings in a specific format (YAML, JSON, ticket body, etc.), produce that on top of the table — but the table is the canonical human output and shouldn't be skipped.

### 5. Append to .tap/learnings.md (if it exists)

If `.tap/learnings.md` exists, append the harvested findings using retrospective's format:

```
[YYYY-MM-DD] — session debrief
- [steer summary] → [gap type] → [specific fix]
```

If the file doesn't exist, skip silently. Don't create it — that's `tap-skills:retrospective`'s job, and creating it from here would couple dev-skills to tap-skills.

## Boundaries

- Does NOT scan the repo (that's `loop-check`)
- Does NOT pull git/gh history (that's `tap-skills:retrospective`)
- Does NOT apply edits itself — routes to the right fix skill
- Does NOT route to harness-local memory or personal global config — only repo-portable fixes (CLAUDE.md, AGENTS.md, `.claude/settings.json`, hooks, skills)
- Does NOT create GitHub tickets (that's retrospective's job)
- Does NOT auto-trigger; user invokes when ready to debrief
- Findings are recommendations, not gates — user decides what to apply
