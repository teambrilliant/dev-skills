---
name: design-language
description: >-
  Capture and enforce a product's visual design language — principles and patterns that
  make it feel like itself. Use when the user wants to: distill design inspiration into
  a durable reference ("capture this design from figma", "distill this screenshot",
  "extract our design language", "capture design direction"), or check an implementation
  against the product's design language ("review design fidelity", "check against design
  direction", "does this match our design?", review a PR for design drift). Core signal:
  user points at a design source (Figma URL, screenshot, live URL) OR built UI and asks
  how it relates to the product's visual language. Operates on a consumer-repo
  `docs/design.md` — proposes diffs, never writes directly. Pairs with shaping-work,
  implementation-planning, implement-change, and qa-test. NOT for: generating new UI (→
  frontend-design), translating a Figma design into code (→ figma-implement-design),
  accessibility audits (→ a11y-debugging), or token extraction.
---

# Design Language

Capture and enforce a product's visual language — principles + patterns that make it feel like itself. Two modes, one skill.

- **Capture** — given an external source (Figma URL, screenshot path, live URL), distill novel layout/hierarchy/density/motion decisions and propose a diff to the consumer repo's `docs/design.md`.
- **Review** — given a component or a built-UI screenshot plus an existing `docs/design.md`, check fidelity and produce a structured critique that cites specific principles and specific lines.

Advisory by default. This skill **never writes to `docs/design.md` directly**. It produces a proposed diff; the user commits.

**Context-efficient design:** heavy source extraction (Figma frame parsing, DOM snapshots, screenshot vision) runs in a sub-agent so raw source data stays out of the main thread. Main thread only sees the distilled observations and the proposed diff.

**Sub-agent rule:** dispatch a sub-agent when extraction involves multiple Figma frames, a full DOM snapshot, or vision analysis of a dense screenshot. Handle directly when the source is a single component file or a short existing diff.

---

## Step 0: Route the Input

Detect from input shape, not a mode flag.

| Input shape | Mode |
|---|---|
| `figma.com/design/...` URL | **Capture** (Figma source) |
| `http(s)://...` URL of a live site | **Capture** (live URL source) |
| Image file path (`.png`, `.jpg`, `.webp`, etc.) | **Capture** (screenshot source) |
| Component file path (`.tsx`, `.vue`, `.svelte`, etc.) + existing `docs/design.md` | **Review** |
| Screenshot of the product's own built UI + existing `docs/design.md` | **Review** |
| External source + no `docs/design.md` yet | **Capture (bootstrap)** — propose the initial `docs/design.md` skeleton from `references/design-md-template.md`, seeded from this source. |

If the user's intent is ambiguous (e.g., a screenshot could be inspiration or the product's own UI), ask one clarifying question before routing.

Always load `references/design-heuristics.md` before running either mode — it is this skill's operational vocabulary. Every finding in output must cite a heuristic section or a principle from `docs/design.md`.

---

## Mode 1: Capture

Distill a source into proposed additions/changes to `docs/design.md`.

### Step 1: Stage the source artifact

Before extraction, stage a durable copy under `thoughts/design-captures/` so the capture is auditable. Filename: `YYYY-MM-DD-{short-description}.{ext}`.

- **Figma URL:** use `mcp__plugin_figma_figma__get_screenshot` to save a PNG of the node, and `mcp__plugin_figma_figma__get_metadata` for structure. Save screenshot under `thoughts/design-captures/`.
- **Live URL:** use `mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page` + `take_screenshot` to capture; save under `thoughts/design-captures/`.
- **Screenshot path:** if outside `thoughts/design-captures/`, copy it in with a dated name. If already there, leave it.

The staged artifact is cited in the proposed diff and logged in `docs/design.md §Captures log`. This is the audit trail for why a principle or pattern exists.

### Step 2: Extract observations (sub-agent)

Launch a sub-agent to extract observations from the staged source. Keep raw source data (full Figma JSON, DOM tree, pixel analysis) out of the main thread.

**Sub-agent prompt:**

```
Extract design observations from this source. Return a structured summary, not raw tool output.

Source type: {figma | live-url | screenshot}
Source location: {URL or staged file path}

Use these tools as relevant:
- Figma: mcp__plugin_figma_figma__get_design_context, get_metadata, get_variable_defs
- Live URL: mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page, take_snapshot,
  evaluate_script (for computed styles of key elements)
- Screenshot: read the image; extract what can be seen.

Reference file: `skills/design-language/references/design-heuristics.md` — use these
section names as your vocabulary.

For each observation:
1. Which heuristic section does it touch? (e.g., §Hierarchy, §Density & Rhythm, §Motion)
2. What specifically is happening? (e.g., "primary CTA uses size + weight + color — three
   levers stacked"; "spacing rhythm tight and consistent between list rows")
3. Can you quantify it? Only if the source is code or Figma; **never** quantify from a
   raw screenshot (vision cannot reliably distinguish 14px from 16px). For screenshots,
   describe qualitatively ("dense", "calm", "airy").
4. Is this observation **novel** to this product, or is it a generic design truth? The
   skill cares only about novel/product-shaping observations.

Return: a numbered list of observations, each with:
- Heuristic section touched
- Specific observation (qualitative or quantitative per rule 3)
- Whether it is novel or generic

Do NOT propose principles or patterns yet. Just observations. Keep under 30 items — if
there are more, return the most distinctive 30.
```

### Step 3: Consolidate before adding (anti-inflation)

**Before proposing any new principle or pattern, read the existing `docs/design.md` and try to consolidate.** This is the most important discipline in Capture mode — every session tends to add, nothing compacts, and the doc rots into contradictory bullets.

For each observation returned by the sub-agent:

1. **Is there an existing principle or pattern in `docs/design.md` that this observation reinforces, refines, or contradicts?**
2. **If reinforces/refines:** propose an edit to the existing entry — tighten the statement, update the citation to include this new source. Do **not** add a new entry.
3. **If contradicts:** add it to the Divergences section (see Step 4). Do **not** silently add a competing principle.
4. **If genuinely novel and uncovered:** a new entry is justified. State in the proposed diff *why* no existing principle covers it.

A new principle requires explicit justification that none of the existing N principles cover the observation. Reject the temptation to add when an existing entry could be strengthened.

### Step 4: Propose the diff

Output the proposed diff inline. The diff must include:

1. **Signature block** — see Output Style.
2. **Source** — what was captured and where it's staged.
3. **Edits to existing entries** (consolidation wins) — for each, the existing entry and the proposed tightened version.
4. **New entries** (only if justified) — each with tag (`[describes]` / `[prescribes]`), statement, Why, Cite.
5. **Divergences** — mandatory section, even if empty. What does this source contradict in the current `docs/design.md`? If nothing contradicts, say so explicitly: *"No divergences from current principles."* Never silently skip.
6. **Captures log entry** — one line pointing at the staged artifact under `thoughts/design-captures/`.

Close with: *"Want me to apply this diff to `docs/design.md`?"* Do not write the diff until the user confirms.

---

## Mode 2: Review

Check a component or built-UI screenshot against the product's `docs/design.md` and produce a structured critique.

### Step 1: Staleness guard

Read `docs/design.md`'s last-modified timestamp (via `git log -1 --format=%cd docs/design.md` or filesystem mtime). If older than **8 weeks**, warn the user:

> *"`docs/design.md` was last updated {date}. Principles may be stale — a review against stale principles can miss real drift. Continue, or capture fresh first?"*

If continuing, note the staleness in the report header.

### Step 2: Read the source (code over pixels)

When both code and a screenshot of built UI are available, **prefer the code**. Claude's vision is unreliable for measurements (14px vs 16px, color stops, precise contrast). Code gives truth.

- **Component file path given:** Read the file directly. Grep for related tokens (spacing classes, color classes, typography classes). Follow imports one level deep if the component composes from primitives that carry the styling.
- **Screenshot only:** use vision to observe qualitatively. Bias toward qualitative findings ("dense", "competing primaries", "uneven rhythm") and away from quantitative ("8px grid violated"). Flag that the review is screenshot-only in the report.
- **Both:** code is source of truth; screenshot is used to cross-check the rendered outcome.

For complex components (multi-file, heavy composition), launch a sub-agent to gather the full surface in one pass:

```
Read {component path} and any components it composes. Return:
1. All style-bearing declarations (Tailwind classes, style props, CSS imports).
2. Any tokens or design constants referenced.
3. A compact summary of the visual structure (what renders at what level).

Do not interpret. Just gather.
```

### Step 3: Critique against principles, patterns, and heuristics

Walk the source against, in this order:

1. **`docs/design.md §Principles`** — does the source honor each describes/prescribes entry? For each finding, cite the principle by number.
2. **`docs/design.md §Anti-principles`** — does the source violate any "we deliberately don't" entries?
3. **`docs/design.md §Functional patterns`** — if the source is a known functional pattern, does it match the canonical composition? If it's a new pattern, flag that.
4. **`docs/design.md §Perceptual patterns`** — does the source carry the product's feel (rhythm, motion personality, chrome quietness)?
5. **`references/design-heuristics.md`** — any heuristic violations not covered above. Cite by section and check ID.

**Specificity is required.** Every finding must:

- Name the principle or heuristic by its number or ID.
- Cite the exact file:line or element.
- State the violation in one line, not vaguely.
- Propose a concrete fix.

Vague findings ("feels off", "could be tighter", "not quite right") are **forbidden**. If an observation cannot be tied to a named principle, pattern, or heuristic, drop it — this skill's vocabulary is what it cites. Uncited criticism is slop.

### Step 4: Report

Output a structured critique. See Output Style.

If there are no findings, say so plainly: *"Review passed. No drift from principles or heuristics observed."* — do not pad with generic praise.

---

## The 9 discipline rules (encoded)

These are the skill's guardrails. Cite them back to yourself when drafting output.

1. **Anti-inflation.** Capture must attempt consolidation before proposing a new principle. A new entry requires explicit justification that no existing principle covers it.
2. **Divergences are mandatory.** Capture output always has a Divergences section. "No divergences" is a valid answer; silence is not.
3. **Code over pixels.** Review prefers source code over screenshots when both exist. Capture-from-screenshot biases toward qualitative language.
4. **Citations required.** Every principle entry in the proposed diff must cite at least one real artifact (code path, staged screenshot, Figma node). No vibes-only principles.
5. **Specificity in critique.** Review findings cite specific file:line or element and specific principle/heuristic by name. Vague language is forbidden.
6. **Descriptive vs prescriptive tagging.** Every principle entry is `[describes]` (current reality) or `[prescribes]` (target). Drift is visible only when the split is explicit.
7. **Anti-patterns are first-class.** Capture proposes Anti-principles ("we deliberately don't do X") with equal weight to positive principles.
8. **Functional vs perceptual patterns stay separate** (Kholmatova). Functional = how things work. Perceptual = how things feel. Each in its own section, named by role / quality respectively.
9. **Staleness guard.** Review checks `docs/design.md` mtime; if > 8 weeks old, warn before critiquing.

Every output should be auditable against these rules.

---

## Output style

**Always open with a Design View block** — mirrors strategic-thinker / product-thinker signature:

```
`★ Design View ───────────────────────────────────`
- [Mode: Capture / Review / Capture (bootstrap)]
- [Lead observation or finding count]
- [Primary risk: e.g., "2 divergences" / "1 stale principle cited" / "screenshot-only review"]
`─────────────────────────────────────────────────`
```

Rules:
- Block appears first, before any analysis or diff.
- 2-4 bullets. Assertions, not hedges.
- Dense, direct, peer tone.

### Capture output shape

```
`★ Design View ───────────────────────────────────`
- Mode: Capture ({source type})
- {N} observations distilled, {M} consolidations, {K} new entries, {J} divergences
- {Headline finding}
`─────────────────────────────────────────────────`

## Source
{staged artifact path, date, one-line description}

## Proposed diff to `docs/design.md`

### Edits to existing entries
(…each edit with old → new…)

### New entries
(…each with tag, statement, why, cite — or "None (consolidated into existing)"…)

### Divergences
(…each: this source contradicts principle {N} because … — or "No divergences."…)

### Captures log entry
- `thoughts/design-captures/{filename}` → informed {which entries}

---

Want me to apply this diff to `docs/design.md`?
```

### Review output shape

```
`★ Design View ───────────────────────────────────`
- Mode: Review ({code / screenshot / code+screenshot})
- {N} findings across {M} principles / heuristics
- {Headline finding or "Review passed"}
`─────────────────────────────────────────────────`

## Scope
- Source: {component path or screenshot}
- `docs/design.md` last updated: {date} {(+ stale warning if applicable)}

## Findings

1. **fails principle {N}: {name}** — {file:line or element}
   - Observation: {one line}
   - Fix: {concrete change}

2. **§{Heuristic section} > {Check ID}** — {file:line or element}
   - Observation: {one line}
   - Fix: {concrete change}

(…or "No findings. Review passed."…)

## Summary
{one-line verdict}
```

### Voice

- Direct and opinionated. "Swap this for a muted gray" not "you might consider a muted gray."
- Peer tone — a design-literate colleague reviewing, not a rubric grader.
- Concise. Every finding earns its place or gets dropped.
- No hedging, no trailing summaries.

---

## Boundaries

- Does **not** write to `docs/design.md` directly. Advisory only; user commits the diff.
- Does **not** generate new UI from scratch — that is `frontend-design`.
- Does **not** translate a specific Figma frame into production code — that is `figma-implement-design`.
- Does **not** audit accessibility — that is `a11y-debugging`. Contrast and focus-ring issues are flagged as *design* issues (via §Contrast heuristics); WCAG-level audit is out of scope.
- Does **not** extract or manage tokens — tokens live in code and Figma Variables. This skill references them, does not duplicate them.
- Does **not** run against multi-product design systems — single-product scope. If a consumer needs to federate a design language across multiple apps, they want a real design-system repo with a component library, not this skill.

---

## Handoffs

When the review or capture reveals a clear next step, offer it.

- Capture mode surfaces a work item (e.g., a `[prescribes]` principle that code doesn't match yet) → *"Want me to shape this drift into a work item?"* → `/dev-skills:shaping-work`.
- Review mode surfaces enough findings to warrant a focused fix → *"Want me to plan these fixes?"* → `/dev-skills:implementation-planning`.
- During `qa-test`, if design fidelity is in scope → run Review mode alongside functional QA; pass findings forward in the QA report.
- During `implement-change`, if a mid-build check is wanted → run Review mode against the in-progress component and feed findings back.

Pass forward: the Design View conclusions, the cited principles/heuristics, and the staged captures — so the next skill doesn't re-read source material.
