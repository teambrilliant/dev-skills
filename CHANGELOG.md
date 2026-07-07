# Changelog

## 2.14.1

- Publishing handoffs: `implementation-planning`, `shaping-work`, and `working-backwards` now end with an offer to publish the produced doc to Dossier (teambrilliant.dev) via `/tap-skills:render-doc` + `/tap-skills:publish` — md stays source of truth, republish after edits.
- Sync `package.json` version with the plugin manifest (was lagging at 2.11.0).

## 2.14.0

- **Moved** `loop-check` and `tighten-loop` to `tap-skills` — they are harness meta-skills (assess / improve the agent harness), completing the assess×learn / full×focused quadrant with `tap-audit` and `retrospective`. Invoke as `/tap-skills:loop-check` and `/tap-skills:tighten-loop`.
- Removes the cross-plugin duplication where `loop-check` mirrored `tap-audit`'s Feedback Loops section.

## 2.13.0

- `product-discovery`: enriched with growth-engineering practice distilled from Komissarouk's *What is Growth Engineering?* (The Pragmatic Engineer).
  - **Core Principle** now frames discovery code as *built to learn, not built to last* — use the lightest materials that produce evidence, skip tests/refactors/migrations until an idea earns the real build, and expect to throw most of it away (a 30–40% ship rate is healthy).
  - **Test Responsibly** gained the *safe Fake Door* technique: make every fake option **worse** than what the customer actually gets (higher price, fewer features), then silently upgrade them — bait-and-switch only offends when the switch is worse than the bait. Includes the MasterClass multi-tier-pricing worked example (pricing page + "you've been upgraded" popup, no backend, demand validated in two weeks).
  - Cross-referenced the fake-door value-experiment bullet to the new safe-running guidance.

## 2.12.0

- **Retired `design-language` skill** — removed the skill and its references (`design-heuristics.md`, `design-md-template.md`). It saw no real use and never stuck as part of the workflow. Removed all cross-references from `qa-test`, `implementation-planning`, `implement-change`, README, and `references/CLAUDE.local.template.md`.

## 2.11.0

- **New `working-backwards` skill** — Amazon's Working Backwards method as a runnable product skill. Write a **PR-FAQ** (mock press release + FAQ) to force clarity on a fuzzy product idea customer-first, iterate on the document, and kill weak ideas cheaply on paper before committing engineering. Sits between `product-thinker` (should we?) and `shaping-work` (what exactly?), alongside `product-discovery` (will it work?). Closes with a `★ Working Backwards View` signature block (customer+benefit / verdict / biggest hole), completing the product-cluster signature set.
  - `references/pr-faq-template.md` — the press-release + FAQ structure section by section (incl. the hard internal FAQ: TAM, per-unit economics, dependencies, feasibility)
  - `references/six-page-narrative.md` — the prose-memo / silent-read discipline for proposals and reviews
  - `references/input-metrics.md` — input-vs-output metrics, DMAIC, the WBR, and the flywheel (for "how will we measure it once live?")
  - distilled from Bryar & Carr's *Working Backwards*

## 2.10.0

- `strategic-thinker`: turned two systems-thinking tools from *vocabulary* into *loadable diagnostics*. The toolkit already spoke Meadows' language (stocks/flows, leverage points) but couldn't run an explicit diagnosis — added the enumerated catalogs as references the skill loads at a systems-analysis moment:
  - **`references/leverage-points.md`** — Meadows' ranked 12 leverage points (numbers → paradigms) for "where do we intervene?" questions; surfaces the counterintuitive truth that most effort pushes the weakest points, often in the wrong direction
  - **`references/system-traps.md`** — the 8 system archetypes (policy resistance, tragedy of the commons, drift to low performance, escalation, success-to-the-successful, shifting-the-burden, rule-beating, wrong-goal) with each one's structural escape; for when a system *resists fixes* or *drifts* regardless of who's involved
  - Wired both into the Systems Thinking Toolkit (augmented the Leverage points bullet, added a System traps bullet) — distilled from Donella Meadows' *Thinking in Systems*

## 2.9.0

- `implementation-planning`: made the skill **harness-agnostic** and reworked its output for at-a-glance comprehension — driven by using these skills with non-Claude-Code agents that lack hardcoded tools
- **Research is now mandatory, not optional.** Dropped the "for simpler tasks, locate + patterns may suffice" license. Four research goals (LOCATE / PATTERNS / ANALYZE / **VALIDATE**) must all be covered; *depth* scales to blast radius. New VALIDATE goal forces confirming the plan's premises against live data/behavior when it depends on runtime facts — a wrong premise produces a wrong plan
- **Portability: capabilities, not tools.** Removed Claude-Code-specific tool names (`EnterPlanMode`/`ExitPlanMode`, `Agent(subagent_type="Explore")`) from the skill body and expressed everything as capabilities: "if your harness has a plan/preview mode, use it — the gate is approval, not the mode"; "if your harness supports sub-agents, fan out in parallel, else work inline." Naming a host's own tools back to it adds no information and reads as hardcoding; naming tools the host lacks is a correctness bug on other harnesses. Persistent `thoughts/plans/` file is always written regardless of harness
- **New ★ Plan View signature block** — planning now closes every response with a summary + ASCII structural map (phases → files → deps → checks) by default, completing the suite's signature-block set (★ Product View / ★ Shaped View / ★ Strategic View). Kills the recurring "explain this plan with ascii" re-prompt. ASCII is a map, not a re-render; full plan stays in the `thoughts/plans/` file
- `## Plan Mode` section reframed to `## Workflow` (research → validate → write → present) — leads with value, demotes mechanism

## 2.8.0

- `implement-change`: fixed over-asking — the skill paused for confirmation between phases and routed *any* plan-vs-reality mismatch to "get guidance," contradicting the pipeline's own contract (plan approval is the gate; upstream skills already resolve every decision)
- New **Execution Contract** section: plan approval authorizes executing all phases to completion without checking in. Adds a two-lane deviation classifier — **resolve-and-keep-going** (trivial mismatches, in-scope choices, passed phases) vs. **pause-and-ask** (unclearable blockers, changes to scope/AC/risk/rollout, false plan premise). Discriminator: does it need the user's judgment *and* would guessing risk material rework?
- Reframed the **Adapt to reality** principle → **Plan is the contract** — deviate only when a step is impossible or wrong; plans guide the *how*, not a license to re-open the *what*
- "Handle Mismatches" now fires only for pause-lane deviations; "Don't" list drops "ask when unclear" in favor of "don't pause between phases or ask about trivia you can resolve in scope"

## 2.7.0

- Added **Rollout & Rollback** as a first-class concern across the workflow — closes the long-standing gap where CD principles (feature flags, expand-contract) were implicit in "reversibility" language but never named or operationalized
- New reference at `skills/implementation-planning/references/rollout-primitives.md` — three-question decision tree (contract / launch / risk), four regimes (neither, expand-contract alone, flag alone, both), worked examples, and explicit anti-patterns
- **Flags serve two purposes — launch control AND reversibility**, not just kill-switching. Two parallel tests: **launch-strategy test** ("who should see this, and when?" — cohort, tier, geo, timing, %-rollout, A/B, dogfooding) and **kill-switch test** ("if bad in prod, what would I do?"). Either justifies a flag. Same flag covers both purposes when both apply
- **Flag lifecycle is purpose-dependent**: short-lived flags (risk, beta, dogfood, %-rollout) are debt if they stay past purpose — plan removal in the same plan that introduces them. Long-lived flags (tier, entitlement, geo, segmentation) are access-control primitives designed to stay. Conflating the two produces either flag-debt graveyards or premature removal of permanent gates
- **One flag per feature, at the user-visible boundary** — not one per phase, not per layer. Internal layers ship dark; the flag gates the entrypoint that lights up the user-perceived feature
- **Substitution rule called out explicitly**: well-executed expand-contract often makes a *risk* flag redundant because the migration cadence is the rollout. (Launch flags are not substituted by expand-contract — different purpose.) Stops the "stack every safety mechanism" anti-pattern AI agents default to
- **Flag system is discovered, not assumed** — lookup order is `.tap/architecture.md` → grep for known imports (`posthog`, `launchdarkly`, `unleash`, etc.) → ask. Don't invent flag infra mid-plan
- **Bug fixes never get flags** — flagging a bug fix is malpractice; the change goes to everyone immediately
- **No canary** — deliberately excluded as ceremony for the team's working model
- `shaping-work`: feature/improvement templates gain a `### Rollout & Rollback` section; bug-fix template states "direct deploy"; examples updated to demonstrate each regime (including launch-driven flagging)
- `implementation-planning`: adds a top-level `## Rollout & Rollback` block to the plan output with explicit `Flag purpose` and `Lifecycle` fields; pointer to rollout-primitives reference at the top of the skill
- `strategic-thinker`: Reversibility dimension in Enumerate & Evaluate becomes "Reversibility & launch control" — names both lenses and warns against conflating "is it safe?" with "does it need a flag?"
- `implement-change`: new "Rollout discipline" rule — don't introduce flags mid-implementation if the plan said direct deploy; don't fragment one feature across multiple flags; never "flag a schema"

## 2.6.0

- Added the **I/O / Function / State** architectural lens as a reusable reference at `skills/strategic-thinker/references/io-function-state.md` and `skills/product-primitives/references/io-function-state.md`
- Wired the lens into `strategic-thinker`'s Systems Thinking Toolkit — answers "where should X live? / where does the seam go?" alongside the existing dynamics-oriented lenses (feedback loops, stocks and flows, leverage points, delay)
- Wired the lens into `product-primitives`' decomposition principles — every primitive should belong cleanly to one layer (boundary, logic, or persistence); layer-mixing is a split signal
- Reference doc covers heuristics (push state to edges, swap at I/O, isolate function from I/O and state), a worked example on test-mock placement, explicit limits (libraries / CLIs / batch ML pipelines where the lens is less useful), and red flags
- Companion to the systems-thinking toolkit: layer placement answers *where*, dynamics answers *how things behave over time*

## 2.5.0

- New skill: **tighten-loop** — end-of-session debrief that harvests course-corrections from the current conversation and converts them into durable, repo-portable fixes
- Sibling to existing `loop-check` (repo-scoped, before-work) and `tap-skills:retrospective` (event-scoped, post-PR/incident); discriminator is *transcript as evidence source*
- Same gap taxonomy as retrospective (Context / Harness / Feedback / Scope) so learnings are interchangeable across the two skills
- Emits findings as **intent kinds** (`project-instruction`, `agent-config`, `tool-install`, `new-skill`, `skill-update`, `test-coverage`) — harness-agnostic so multi-agent orchestrators can translate to their own durable-state mechanism (file edit, memory tool call, vector store, etc.)
- New `skill-update` intent: when a steer reveals that an existing skill produced wrong behavior, fix the skill rather than adding rules around it
- Routes only to **repo-portable fixes** (CLAUDE.md, AGENTS.md, `.claude/settings.json`, hooks, skills) — explicitly does not route to harness-local memory or personal global config, since those don't travel with the project
- Empty-harvest discipline: thin or empty harvests on low-friction sessions are a correct outcome, not a failure — the skill says so honestly rather than padding
- Optionally appends to `.tap/learnings.md` when present, converging logs with retrospective without coupling dev-skills to tap-skills

## 2.4.1

- design-language: trimmed description under Anthropic's 1024-char skill-description limit; consolidated trigger phrases without losing routing precision

## 2.4.0

- New skill: **design-language** — capture a product's visual language into a living `docs/design.md`, and check implementations against it
- Two modes: **Capture** (Figma URL / screenshot / live URL → proposed diff to `docs/design.md`) and **Review** (component or built-UI screenshot + existing `docs/design.md` → structured critique)
- Baseline heuristics bake in Rams's 10 principles, Refactoring UI, Kholmatova's functional-vs-perceptual pattern split, and Butterick typography depth — as operationalizable checklists, not prose
- Starter `docs/design.md` template with `[describes]` / `[prescribes]` tagging, first-class anti-principles, mandatory citations, and separate functional / perceptual pattern sections
- Anti-inflation discipline: Capture consolidates into existing entries before proposing new ones; Divergences section is mandatory
- Staleness guard: Review warns if `docs/design.md` is > 8 weeks old before critiquing against potentially stale principles
- Cross-cutting across stages 2-5 (shape → plan → implement → QA)
- Wired into neighbor skills: `qa-test` offers Review after functional QA for UI-visible changes; `implement-change` offers mid-build Review for UI-heavy phases; `implementation-planning` nudges pattern reuse via `docs/design.md §Functional patterns`; `CLAUDE.local.template.md` adds Review to the post-implement verify step
- Cross-cutting: added explicit sub-agent guidance to exploration-heavy skills (`product-thinker`, `qa-test`, `implement-change`, `strategic-thinker`) — main thread stays lean during research

## 2.3.0

- New skill: **strategic-thinker** — cross-domain strategic reasoning for approach selection, tradeoff evaluation, and systems-level analysis
- Four routed lenses: Enumerate & Evaluate (multi-path comparison), Zoom Stack (30k / 10k / ground-level altitude shifts), Stress Test (attack a plan before committing), First Principles Decomposition (strip inherited assumptions, rebuild from real constraints)
- Systems-thinking foundation throughout — feedback loops, stocks and flows, leverage points, emergence, delays — applied in *how* we reason, not surfaced as vocabulary
- `★ Strategic View ` signature block leads every output; mandatory **Key assumption** tripwire closes it
- Handoffs into `product-thinker` / `shaping-work` / `implementation-planning` / `product-discovery` with context passthrough so the next skill doesn't restart from scratch

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
