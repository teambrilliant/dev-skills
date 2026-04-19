# `docs/design.md` template

Copy this skeleton to `docs/design.md` in the consumer repo as the starting point. Replace the worked examples with your own; keep the structure.

**Conventions baked in:**

- Every principle is tagged `[describes]` (snapshot of current reality) or `[prescribes]` (aspirational / target state). This keeps drift visible — if you see a `[prescribes]` that doesn't match the code, that's a work item.
- Every entry cites at least one real artifact (component file path, screenshot under `thoughts/design-captures/`, or Figma node ID). No vibes-only principles — unanchored entries rot.
- Functional patterns (how things *work*) and perceptual patterns (how things *feel*) live in separate sections. Kholmatova's split — a change in one doesn't imply a change in the other.
- Anti-principles are first-class — "what we deliberately don't do" is often more constraining than positive principles.
- Tokens live in code and Figma Variables, not in this file. This file references; it doesn't duplicate.

---

```markdown
# {Product} Design Language

*One sentence: what {product} feels like at its core.*

Example: *Calm, dense, keyboard-first — built for people who live in the app 6 hours a day and want it out of their way.*

---

## Principles

Numbered so you can cite them in PR review ("fails principle 3"). Each entry carries a tag, a one-line statement, the reason, and a citation.

### 1. [describes] Density over airiness
Information per screen is high because our users are operators, not browsers.
- **Why:** ops users scan and compare; whitespace-heavy layouts force scrolling and lose comparison.
- **Cite:** `apps/console/src/routes/pipelines/index.tsx` — 10-row viewport at default height.

### 2. [prescribes] Quiet chrome, loud content
App chrome (nav, toolbars, breadcrumbs) recedes; content does the talking.
- **Why:** we want the user's eye on their data, not on our frame.
- **Cite:** `apps/console/src/layouts/app-shell.tsx` — target state; see also `thoughts/design-captures/2026-04-15-linear-chrome.png` for reference.

### 3. [describes] Keyboard-first, mouse-forgivable
Every primary action has a keyboard shortcut; mouse works but never wins.
- **Why:** our users muscle-memory the product; hunt-and-click interfaces lose them.
- **Cite:** `apps/console/src/components/command-palette.tsx`, `apps/console/src/hooks/use-keybindings.ts`.

### 4. [prescribes] Motion earns its place
Motion communicates a state change or spatial continuity. Never decoration.
- **Why:** decorative motion costs perceived speed; our users run the app all day.
- **Cite:** `apps/console/src/components/panel-reveal.tsx` — target; current list-item fade in `apps/console/src/components/item-row.tsx` violates this and is flagged for removal.

---

## Anti-principles

What we deliberately **don't** do. Equal weight to the positive principles — often more constraining.

### A1. We don't use color to convey state alone
Every state (error, warning, success) carries an icon or a shape in addition to color. Color-blindness and quick-glance misreads.
- **Cite:** `apps/console/src/components/status-chip.tsx`.

### A2. We don't auto-save without acknowledging
We are not Google Docs. Ops users want a visible "saved" confirmation, because a silent save in a destructive context is terrifying.
- **Cite:** `apps/console/src/components/form-footer.tsx`.

### A3. We don't use illustrations in empty states
Illustrations read as consumer; our product is for operators. Empty states use typography and a single primary action.
- **Cite:** `apps/console/src/components/empty-state.tsx`.

---

## Functional patterns

*How things work.* Named by role, not appearance. Each pattern points to a real component that is the canonical example.

### FP.thread-panel
The right-side panel that opens to show a thread of activity for any entity (pipeline run, deployment, incident).
- **Composition:** header (entity ref + close), scrollable log, composer at bottom.
- **When to use:** any entity with a chronological activity stream.
- **Canonical:** `apps/console/src/components/thread-panel.tsx`.

### FP.bulk-action-bar
The bar that appears above a list when items are selected, carrying the available bulk actions.
- **Composition:** selection count + actions (primary + overflow) + dismiss.
- **When to use:** any multi-select list with destructive or batch operations.
- **Canonical:** `apps/console/src/components/bulk-action-bar.tsx`.

### FP.filter-drawer
Persistent filter controls rendered in a left-anchored drawer, collapsible but defaulting to open on desktop.
- **Composition:** filter groups, each with its own apply-on-change behavior.
- **When to use:** any list view with ≥ 3 filter dimensions.
- **Canonical:** `apps/console/src/components/filter-drawer.tsx`.

---

## Perceptual patterns

*How things feel.* Named by quality, not mechanism. Each pattern points to a surface where the feel lives.

### PP.crisp-feedback
Button presses, toggles, and form submissions respond inside 150ms with a single, decisive transition. No bounces, no spring physics.
- **Where it lives:** `apps/console/src/routes/settings/*` — all form interactions.
- **Reference:** `thoughts/design-captures/2026-04-12-crisp-feedback-linear.mp4`.

### PP.quiet-rhythm
Vertical spacing across list views is consistent and tight (`gap-2` / 8px), creating a steady beat that supports scanning without feeling cramped.
- **Where it lives:** `apps/console/src/routes/pipelines/index.tsx`, `apps/console/src/routes/deployments/index.tsx`.
- **Reference:** `apps/console/src/components/item-row.tsx`.

### PP.dimmed-ambient
Non-primary UI (breadcrumbs, timestamps, meta text, tab bars) sits one notch below primary text in both weight and color. The product reads as "quiet" without being washed out.
- **Where it lives:** app shell and list surfaces across the product.
- **Reference:** `apps/console/src/layouts/app-shell.tsx`.

---

## Tokens

Tokens live in code, not here. See:

- **CSS variables:** `apps/console/src/styles/tokens.css`.
- **Tailwind config:** `apps/console/tailwind.config.ts`.
- **Figma Variables:** {Figma URL to the Variables page}.

This file references tokens by semantic name (e.g., "uses `--color-accent`"); do not duplicate values here.

---

## Captures log

Source artifacts that informed principles and patterns above. Each capture is a dated file under `thoughts/design-captures/`.

- `thoughts/design-captures/2026-04-12-crisp-feedback-linear.mp4` → informed **PP.crisp-feedback**.
- `thoughts/design-captures/2026-04-15-linear-chrome.png` → informed **principle 2**.
- `thoughts/design-captures/2026-03-28-bulk-actions-height.png` → informed **FP.bulk-action-bar** spec.

File naming: `YYYY-MM-DD-{short-description}.{ext}`. Keep the raw source — it is the audit trail for why a principle or pattern exists.
```

---

## Usage notes for the skill

When Capture mode proposes a diff to `docs/design.md`:

1. It must land under the right section (Principle / Anti-principle / Functional pattern / Perceptual pattern).
2. It must include the tag (`[describes]` or `[prescribes]`).
3. It must include a Cite line. If the source is a screenshot or Figma node, the skill stages that artifact under `thoughts/design-captures/YYYY-MM-DD-{desc}.{ext}` as part of the same diff and adds an entry to the captures log.
4. It must first check whether an existing entry can be strengthened or refined, rather than adding a new one. Principle inflation is the failure mode.

When Review mode critiques a component:

1. Every finding names a principle or pattern by its number / ID (e.g., "fails principle 3" or "drifts from PP.crisp-feedback").
2. Every finding cites the specific line or element.
3. Vague language ("feels off", "could be better") is forbidden — if it can't be tied to a named principle or heuristic, it isn't a finding.
