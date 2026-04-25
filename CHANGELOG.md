# Changelog

## 2.5.0

- New skill: **tighten-loop** — end-of-session debrief that harvests course-corrections from the current conversation and converts them into durable, repo-portable fixes
- Sibling to existing `loop-check` (repo-scoped, before-work) and `tap-skills:retrospective` (event-scoped, post-PR/incident); discriminator is *transcript as evidence source*
- Same gap taxonomy as retrospective (Context / Harness / Feedback / Scope) so learnings are interchangeable across the two skills
- Emits findings as **intent kinds** (`project-instruction`, `agent-config`, `tool-install`, `new-skill`, `skill-update`, `test-coverage`) — harness-agnostic so multi-agent orchestrators can translate to their own durable-state mechanism (file edit, memory tool call, vector store, etc.)
- New `skill-update` intent: when a steer reveals that an existing skill produced wrong behavior, fix the skill rather than adding rules around it
- Routes only to **repo-portable fixes** (CLAUDE.md, AGENTS.md, `.claude/settings.json`, hooks, skills) — explicitly does not route to harness-local memory or personal global config, since those don't travel with the project
- Empty-harvest discipline: thin or empty harvests on low-friction sessions are a correct outcome, not a failure — the skill says so honestly rather than padding
- Optionally appends to `.tap/learnings.md` when present, converging logs with retrospective without coupling dev-skills to tap-skills

## 2.4.0

- New skill: **design-language** — capture a product's visual language into a living `docs/design.md`, and check implementations against it
- Two modes: **Capture** (Figma URL / screenshot / live URL → proposed diff to `docs/design.md`) and **Review** (component or built-UI screenshot + existing `docs/design.md` → structured critique)
- Baseline heuristics bake in Rams's 10 principles, Refactoring UI, Kholmatova's functional-vs-perceptual pattern split, and Butterick typography depth — as operationalizable checklists, not prose
- Starter `docs/design.md` template with `[describes]` / `[prescribes]` tagging, first-class anti-principles, mandatory citations, and separate functional / perceptual pattern sections
- Anti-inflation discipline: Capture consolidates into existing entries before proposing new ones; Divergences section is mandatory
- Staleness guard: Review warns if `docs/design.md` is > 8 weeks old before critiquing against potentially stale principles
- Cross-cutting across stages 2-5 (shape → plan → implement → QA)
- Wired into neighbor skills: `qa-test` offers Review after functional QA for UI-visible changes; `implement-change` offers mid-build Review for UI-heavy phases; `implementation-planning` nudges pattern reuse via `docs/design.md §Functional patterns`; `CLAUDE.local.template.md` adds Review to the post-implement verify step

## 2.2.1

- New principle in `software-design-philosophy.md` (planning + implement-change variants): **Domain rules live once** — a business invariant belongs in one domain module, consumed by every surface; adding a type/branch per caller is duplication disguised as generalization
- New red flag: **Surface-duplicated rule** — same status/ownership/eligibility check across Calendar/Canvas, API/UI, mobile/web → lift to domain

## 2.2.0

- Wired acceptance criteria as a first-class contract across the pipeline, informed by Anthropic's "Harness Design for Long-Running Apps" (generator-evaluator separation, sprint contracts)
- **shaping-work**: ACs must be independently testable, observable, non-vague — enforces contract quality at the source
- **implementation-planning**: new `## Acceptance Criteria` section links to the shape doc (no restating); per-phase `Verification` renamed to `Phase Checks` to clarify technical gates ≠ ACs
- **qa-test**: shape doc is now the primary AC source (diff inference demoted to last resort); added evaluator skepticism rules (binary pass/fail, cited evidence, no rationalization, specific bugs); after 2 failed fix-and-retest cycles, escalate to re-plan or human instead of looping

## 2.1.0

- Dropped User Story line from shaping-work feature template — the description paragraph already covers who/what/why without the rigid "As a / I want / So that" format
- Updated examples to fold user context into the description sentence

## 2.0.0

- **Breaking**: open questions in shaping-work and implementation-planning now require recommended resolution with reasoning + discarded alternatives
- Updated all shaping-work templates and examples to use `Recommend: / Discarded:` format
- Added "Decide, don't ask" principle to implementation-planning
- CLAUDE.local.md template includes decision proposal rule

## 1.9.0

- New skill: **loop-check** — pre-flight feedback loop assessment before starting work
- Scans for manual workflows, open loops, missing tools; prescribes concrete automation paths
- Stage -1 in the pipeline: `loop-check → primitives → shape → plan → implement → QA`

## 1.8.1

- Dropped backlog-grooming concept — phases in implementation plans replace ticket decomposition at agent-speed dev
- Removed backlog-grooming handoff reference from shaping-work

## 1.8.0

- Added `★ Product View` signature block to product-thinker output
- Added `★ Shaped View` ASCII tree block to shaping-work output
- Signature blocks appear first, signaling skill was used

## 1.7.0

- product-thinker: Step 0 routes questions as generic vs product-specific — only explores codebase when needed
- Product-shaped sub-agent exploration (not technical audit) for product-specific questions
- Seamless handoff offer from product-thinker to shaping-work with context passthrough
- shaping-work accepts handed-off context, skips re-exploration

## 1.6.0

- New skill: **product-discovery** — validate whether a product idea is worth building before committing engineering investment
- 4-risk framework: value, usability, feasibility, viability

## 1.5.0

- product-thinker: added emotions-to-be-evoked framework for UX-sensitive decisions

## 1.4.0

- Updated README with typical flow diagram and product-thinker placement

## 1.3.0

- Renamed systems-decomposition to **product-primitives** with Ousterhout method integration

## 1.2.0

- implement-change: simplified to plan-first workflow, broader triggers, QA handoff

## 1.1.0

- implementation-planning: deduplication, fixed sub-agents, broader triggers

## 1.0.0

- Integrated Ousterhout's software design philosophy across all skills
- Added `references/software-design-philosophy.md`

## 0.4.0

- product-thinker: optimized triggers, build-vs-buy analysis, sub-agent cleanup

## 0.3.0

- shaping-work: flexible output templates (feature, bug fix, improvement), broader triggers

## 0.2.0

- qa-test: sub-agent delegation, snapshot-only verification

## 0.1.0

- Initial release: shaping-work, implementation-planning, implement-change, product-thinker, qa-test
