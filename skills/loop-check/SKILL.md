---
name: loop-check
description: >-
  Assess what's needed to make feedback loops autonomous in a repo. Use when someone says
  "loop check", "what do I need to work autonomously", "check my feedback loops", "what's
  manual here", "what should I automate", "can an agent iterate here", or before starting
  work in an unfamiliar repo to understand what's missing for autonomous iteration. Also use
  when the user asks "what do you need to make this autonomous?" or describes a workflow they
  want to close the loop on. NOT for: full repo audits (use tap-audit), coding, test writing,
  or implementation.
---

# Loop Check

Answer one question: **"What's needed to make feedback loops autonomous in this repo?"**

Find what's manual, what's missing, and prescribe concrete automation paths. This is not a full audit — it's a focused scan on feedback loops only.

## Process

1. Discover workflows
2. Assess each loop
3. Prescribe fixes
4. Present findings

### 1. Discover Workflows

Find the top 3 workflows in this repo — both automated and manual. If the user specified a task ("I'm about to generate sprites"), prioritize workflows relevant to that task.

**Run these scans:**

**Binary assets without generators** — find committed images, fonts, audio, video, PDFs. Check if generation scripts, Makefiles, or asset pipelines produce them. If assets exist but no script generates them, that's a manual creation workflow.
```
Find: *.png, *.jpg, *.svg, *.gif, *.mp3, *.wav, *.pdf, *.ttf, *.otf
Then: look for Makefile, generate-*.sh, scripts/, or build steps that produce them
Missing generator = manual workflow
```

**Git history churn** — files re-committed with small changes repeatedly suggest a manual iteration loop. Look for binary files or config files with many commits.
```
git log --all --diff-filter=M --name-only --pretty=format: | sort | uniq -c | sort -rn | head -20
```
High re-commit count without associated test/script changes = manual iteration.

**Human-in-the-loop scripts** — scan shell scripts and docs for steps requiring visual inspection, manual input, or human judgment:
- Scripts that open a window/browser and wait for a human to look
- Steps phrased as "then you...", "manually...", "visually check...", "inspect the output"
- Scripts with `read`, `open`, `sleep` (waiting for human), or comments like "# check this looks right"

**Workflow descriptions in docs** — read CLAUDE.md, README, and contributing guides. Any multi-step process described in prose is a candidate. Pay attention to sequences like "first run X, then check Y, then run Z" — that's an unautomated pipeline.

**Existing tap-audit** — if `.tap/tap-audit.md` exists, read its feedback loops section. Don't redo that work, but check if its findings are still current.

### 2. Assess Each Loop

For each discovered workflow, evaluate four elements:

| Element | Question |
|---------|----------|
| **Generator** | Can an agent produce the output? If not, what's missing — a skill, an MCP, a CLI tool, an API? |
| **Evaluator** | Can something *other than the generator* verify the output? Tests, lint, visual regression, Playwright, type checker, screenshot comparison? |
| **Handoff** | Can an agent context-reset and resume without losing progress? Shaped docs, plans, clear commit history, memory files? |
| **Grading criteria** | Are quality expectations measurable? Test suites, lint rules, acceptance criteria, dimension/palette specs, design specs? Or is it vibes? |

Rate each workflow:

- **Closed** — all four elements present. Agent can iterate autonomously.
- **Open** — evaluator or grading criteria missing. Agent produces output but can't verify quality.
- **No loop** — no evaluator, no criteria. Agent guesses and hopes.
- **Manual** — human does this entirely by hand. No agent involvement yet.

### 3. Prescribe Fixes

For each non-closed workflow, prescribe a concrete automation path. Be specific about what to create:

- **Skill to create** — name it, describe what it does, what tools it needs. "Create a sprite-generation skill that uses image-gen MCP to produce pixel art PNGs, validates dimensions and palette against a spec, and renders in-app via dev-check.sh."
- **MCP to wire up** — which server, what it enables. "Add chrome-devtools MCP to enable visual regression testing of the rendered diorama."
- **Hook to add** — what event, what it does. "Add a PostToolUse hook on Write that validates PNG dimensions match the sprite spec."
- **Tool to integrate** — CLI tool, API, or service. "Install Playwright for browser-based acceptance testing of the onboarding flow."
- **Test to write** — what kind, what it covers. "Add acceptance tests using /design-acceptance-tests for the station assignment state machine."
- **Grading criteria to define** — measurable specs. "Define pixel art constraints: 32x32px, 4-color palette per character, .nearest filtering, specific pose set."

Don't prescribe generic improvements. Every recommendation should name a specific thing to build, wire, or configure.

### 4. Present Findings

Always open with the signature block:

```
`★ Loop Check ────────────────────────────────────`
[N] workflows assessed — [N closed] / [N open] / [N manual]
  ├─ [most impactful finding]
  ├─ [second finding]
  └─ [top recommendation to close a loop]
`─────────────────────────────────────────────────`
```

Then for each workflow, present the assessment and prescription. Lead with the manual and open workflows — closed loops don't need attention.

If everything is closed: say so and get out of the way. Don't invent problems.

## Boundaries

- Does NOT write code, tests, or config — prescribes what to create, doesn't create it
- Does NOT assess infrastructure (CI/CD, permissions, test coverage stats — that's tap-audit)
- Does NOT produce a report file — output is conversational, not a document
- Does NOT auto-run — manual invocation only
- Findings are recommendations, not gates — nothing blocks the user from proceeding
