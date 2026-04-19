# Design Heuristics

The skill's operational opinion on visual design. Every heuristic is a checklist question — yes/no or "where does this appear" — not a prose summary.

When using this file, **scan the relevant sections for the surface under review**, tick each check as answerable or not, and cite the specific heuristic by name in Capture and Review output (e.g., "fails §Contrast > Medium on medium").

If you cannot answer a check from the available evidence (code, screenshot, Figma), say so explicitly — do not guess. Claude's vision cannot reliably distinguish 14px from 16px spacing; bias toward qualitative answers ("dense", "airy") unless you have the source code in hand.

---

## Rams' 10 principles (North Star)

Good design is:
1. **Innovative** — does the form follow from the actual problem, not trend?
2. **Useful** — does it serve the product's job-to-be-done?
3. **Aesthetic** — is it pleasing without being decorated?
4. **Understandable** — can a user predict what each element does?
5. **Unobtrusive** — does it recede when the user's attention is elsewhere?
6. **Honest** — does it promise only what it delivers?
7. **Long-lasting** — would this still read as competent in 5 years?
8. **Thorough** — are edges, empty states, errors, and loading as considered as the happy path?
9. **Environmentally friendly** — resource-conscious (bundle size, images, motion)?
10. **As little design as possible** — has every element earned its place?

Use these as the final sanity check after running the specific heuristics. If a design passes the detail checks but fails one of the ten, the detail checks were the wrong zoom.

---

## How to use this file

Each heuristic follows the same shape:

- **Check:** a question with a yes/no or "where" answer
- **Where to look:** concrete location (file, element, CSS property, screenshot region)
- **How to flag:** the exact language to use when citing it

Every flag lands in output as: *"§{Section} > {Check name} — {specific location} — {observation}"*.

---

## §Hierarchy

Size, weight, color, spacing are the four levers. Never two at once when one suffices.

### H1. Emphasis accumulates, it doesn't stack

- **Check:** when an element is emphasized, is exactly one lever doing the work (bigger **or** bolder **or** darker **or** more space), or multiple stacked?
- **Where to look:** headline vs body contrast, primary button vs secondary button, selected state vs default.
- **How to flag:** "emphasis stacking: {element} uses larger size AND heavier weight AND higher contrast color — pick one."

### H2. Levels are countable

- **Check:** can you number the visual levels on the screen (1 = primary, 2 = secondary, 3 = tertiary, 4 = ambient)? More than 4 active levels in one view is a smell.
- **Where to look:** any dense view (dashboards, lists, forms).
- **How to flag:** "hierarchy inflation: {surface} presents {N} competing levels; target ≤ 4."

### H3. The primary action is unmistakable

- **Check:** in a single glance, is the single most important action obvious?
- **Where to look:** any view with a CTA (forms, dialogs, empty states).
- **How to flag:** "ambiguous primary: {surface} — {reason, e.g., two buttons equally emphasized}."

### H4. Labels are quieter than values

- **Check:** in data pairs (Label: Value), is the label visually de-emphasized relative to the value?
- **Where to look:** detail panels, summary cards, receipts, metric tiles.
- **How to flag:** "label dominates value: {component} — swap weight/color."

---

## §De-emphasis

Reducing the non-essential is more powerful than emphasizing the essential.

### D1. Supporting text is quiet

- **Check:** is body copy, helper text, meta, timestamp rendered in a genuinely softer color (not black, not primary)?
- **Where to look:** `color` on `<p>`, `<small>`, `.meta`, `.helper-text`.
- **How to flag:** "supporting text uses primary text color — demote to a muted gray."

### D2. Chrome fades, content leads

- **Check:** do frame elements (toolbars, breadcrumbs, tab bars) recede relative to content?
- **Where to look:** app chrome vs primary content area.
- **How to flag:** "chrome competes with content: {location} — reduce contrast or size of chrome."

### D3. Dividers are a last resort

- **Check:** is a divider doing a job that spacing could do alone?
- **Where to look:** cards, list items, sections.
- **How to flag:** "unnecessary divider: {location} — remove and rely on spacing."

### D4. Icons are tools, not decoration

- **Check:** does each icon carry meaning (action, status, category) or is it filler?
- **Where to look:** nav items, buttons, list rows.
- **How to flag:** "decorative icon without semantic load: {location}."

---

## §Density & Rhythm

Consistent spacing scale (geometric, not linear). Vertical rhythm tied to type scale.

### DR1. Spacing comes from a scale

- **Check:** do spacing values come from a defined scale (e.g., 4, 8, 12, 16, 24, 32, 48, 64) or are they ad hoc (17px, 22px, 11px)?
- **Where to look:** raw CSS/Tailwind classes — grep for off-scale values like `gap-[17px]`, `margin: 22px`.
- **How to flag:** "off-scale spacing at {file:line}: {value} — should be {nearest scale value}."

### DR2. Similar things get similar space

- **Check:** do list items, cards, menu rows in the same surface use the same vertical rhythm?
- **Where to look:** any repeating component.
- **How to flag:** "rhythm break: {component} alternates {value A} and {value B} between items."

### DR3. Related things huddle; unrelated things separate

- **Check:** is the space **between** groups larger than the space **within** groups?
- **Where to look:** form field groupings, nav sections, card clusters.
- **How to flag:** "proximity inverted: {group} has tighter spacing to its neighbor than to its own members."

### DR4. Density matches purpose

- **Check:** is a dense view (table, dashboard) actually dense, and a calm view (onboarding, marketing) actually calm? Or is everything medium-density?
- **Where to look:** compare the densest and calmest surfaces in the product.
- **How to flag:** "density flat across surfaces — {dense-surface} and {calm-surface} use indistinguishable spacing."

### DR5. Vertical rhythm tracks line-height

- **Check:** does block spacing relate to the line-height of surrounding text (e.g., 1.5× line-height as a default gap)?
- **Where to look:** paragraph-to-paragraph, heading-to-paragraph spacing.
- **How to flag:** "rhythm detached from type: {section} uses fixed spacing unrelated to line-height."

---

## §Contrast

Between sections, between states, between emphasis levels. Avoid medium grays on medium grays.

### C1. No medium-on-medium

- **Check:** any text where both foreground and background sit in the middle of the lightness range (e.g., gray-500 on gray-100)?
- **Where to look:** helper text, form placeholders, secondary labels.
- **How to flag:** "medium-on-medium at {element}: {fg} on {bg} — push fg darker or bg lighter."

### C2. States are unmistakable

- **Check:** can you tell hover / active / focus / disabled / selected from default at a glance, without hover-revealing?
- **Where to look:** interactive elements (buttons, rows, toggles).
- **How to flag:** "state indistinct: {element} — {which states collapse}."

### C3. Focus ring is present and visible

- **Check:** does keyboard focus show a ring that survives both light and dark backgrounds?
- **Where to look:** Tab-through any form or list.
- **How to flag:** "focus invisible at {element} — missing outline or outline lost on {background}."

### C4. Section breaks read

- **Check:** do major sections (hero, feature grid, footer) read as distinct without requiring borders?
- **Where to look:** long marketing or docs pages.
- **How to flag:** "sections bleed: {section A} and {section B} share tone and spacing; reader loses structure."

### C5. Body text contrast passes accessibility minimums

- **Check:** WCAG AA (4.5:1) for body, 3:1 for large text? (Flag as design issue; defer to `a11y-debugging` for audit.)
- **Where to look:** primary body text, secondary text, link text.
- **How to flag:** "contrast smells low at {element}: {fg} on {bg} — verify via contrast checker."

---

## §Grouping (Gestalt)

Proximity > borders > backgrounds. Use the lightest tool that works.

### G1. Proximity carries the grouping

- **Check:** are related elements close enough that they read as a group **without** needing a box?
- **Where to look:** form fields, navigation groups, metadata clusters.
- **How to flag:** "grouping relies on box/border when proximity alone could carry — try removing the container."

### G2. Common fate groups motion

- **Check:** do elements that share behavior (reveal together, scroll together) animate in unison?
- **Where to look:** staggered reveals, multi-part transitions.
- **How to flag:** "motion dissociates grouped elements: {group} animates with inconsistent timing."

### G3. Similarity groups style

- **Check:** do same-category items share visual treatment (weight, color, shape)?
- **Where to look:** tag lists, status chips, nav items.
- **How to flag:** "inconsistent styling within category: {category} — align treatment."

### G4. Enclosure is the last lever

- **Check:** if a box or card is used, is it because proximity / similarity / common color truly failed?
- **Where to look:** any card-heavy surface.
- **How to flag:** "over-enclosure: {surface} — try flattening one level of nesting."

---

## §Alignment

Optical, not mathematical. Icon-to-text baselines are the common failure.

### A1. Icons sit on text baselines

- **Check:** when an icon is inline with text, does its optical center sit on the text's x-height, not its mathematical center?
- **Where to look:** buttons with leading icons, inline status indicators, menu items.
- **How to flag:** "icon mis-baselined at {element} — adjust translate-y or verify icon metrics."

### A2. Edges align across components

- **Check:** do related components (e.g., form label column and input column) share left/right edges?
- **Where to look:** forms, side-by-side cards, table columns.
- **How to flag:** "edge misalignment: {element A} and {element B} drift by ~{amount}."

### A3. Numbers use tabular figures where comparison matters

- **Check:** in tables, lists of prices, metrics — are digits tabular (fixed width) so columns align?
- **Where to look:** any numeric column or list.
- **How to flag:** "proportional figures in comparison context at {location} — set `font-variant-numeric: tabular-nums`."

### A4. Mixed alignments feel deliberate, not accidental

- **Check:** if a surface mixes left- and center-alignment, does each serve a clear role, or is it drift?
- **Where to look:** hero sections, dialogs.
- **How to flag:** "alignment drift at {surface} — unify or justify the split."

---

## §Color

60/30/10 at the palette level. Saturated for action, desaturated for surfaces. Never convey state with color alone.

### CO1. Palette is anchored

- **Check:** does the product read as 60% neutral surface, 30% content/brand, 10% accent/action? Or is it a rainbow?
- **Where to look:** take a screenshot of a dense view; squint.
- **How to flag:** "palette unanchored: {surface} — identify which role each color plays."

### CO2. Action color is reserved

- **Check:** is the accent color used **only** for primary action and key signaling? Or is it decorating headings, borders, tags?
- **Where to look:** grep for the primary color token across the codebase.
- **How to flag:** "accent diluted: primary color appears in {N} decorative locations."

### CO3. State is not color-only

- **Check:** do error / warning / success states carry an icon or shape in addition to color?
- **Where to look:** form validation, status chips, alerts.
- **How to flag:** "state conveyed by color alone at {element} — add icon or shape."

### CO4. Surfaces step with intent

- **Check:** do elevated surfaces (cards, modals, popovers) use lightness steps that carry meaning, or random values?
- **Where to look:** z-layer progression: page > card > modal > popover.
- **How to flag:** "elevation steps inconsistent: {layer} breaks the progression."

### CO5. Dark mode is deliberate

- **Check:** in dark mode, does the palette invert with intent (not auto-inverted), preserving hierarchy and warmth?
- **Where to look:** compare light and dark surfaces of the same view.
- **How to flag:** "dark mode auto-inverted: {surface} loses warmth / hierarchy."

---

## §Typography

Typography is ~40% of visual judgment. Borrow heavily from Butterick here.

### T1. Type scale is limited

- **Check:** how many distinct font sizes appear on a single screen? Six or more is a smell.
- **Where to look:** grep type-scale classes; audit a representative view.
- **How to flag:** "type-scale sprawl: {view} uses {N} sizes — consolidate."

### T2. Line-height shrinks as size grows

- **Check:** does the largest heading use a tighter line-height (~1.0–1.2) than body text (~1.5–1.7)?
- **Where to look:** display, headline, body, caption leading values.
- **How to flag:** "line-height inversion: {heading} uses generous leading while body is tight."

### T3. Measure is 45–75 characters for prose

- **Check:** for paragraph-heavy surfaces (docs, marketing, long-form), is the line length between 45 and 75 characters?
- **Where to look:** `<p>` widths in blog/docs/marketing content.
- **How to flag:** "long measure: {element} — lines ~{estimated} ch; cap via max-width."

### T4. Leading is proportional to measure

- **Check:** does a long measure use generous leading (≥ 1.6) and a short measure use tighter leading?
- **Where to look:** any content column.
- **How to flag:** "leading mismatched to measure: {element}."

### T5. Font pairing has a job split

- **Check:** if two typefaces are used, does each have a clear role (display vs body, or sans vs mono for code)?
- **Where to look:** global font stack, any display type.
- **How to flag:** "pairing without role split: {fonts} — define when each is used."

### T6. System-font-only is a choice, not a default

- **Check:** if using system fonts only, is that a stated aesthetic choice, or is it a default nobody pushed past?
- **Where to look:** `font-family` declarations.
- **How to flag:** "system fonts as default — confirm intent; if not, consider a typographic voice."

### T7. Quotes are curly, apostrophes are typographic

- **Check:** does rendered copy use `" "` and `'` (curly), not `"` and `'` (straight)?
- **Where to look:** static strings in JSX / i18n files, rendered output.
- **How to flag:** "straight quotes at {location} — replace with `“`, `”`, `’`."

### T8. Non-breaking spaces where they matter

- **Check:** are numerals and units joined with `&nbsp;` (e.g., `10&nbsp;MB`, `Mr.&nbsp;Smith`) so they don't break at line ends?
- **Where to look:** unit displays, names, short phrases that should not split.
- **How to flag:** "breakable unit/name pair at {location} — use non-breaking space."

### T9. Numbers get tabular figures in comparison

- **Check:** see §Alignment A3 — same check.
- **Where to look:** same.
- **How to flag:** "proportional figures in comparison context — switch to tabular-nums."

### T10. Hyphenation and widow control on prose

- **Check:** for long-form content, are hyphens enabled (`hyphens: auto`) and widows avoided in headlines?
- **Where to look:** paragraph CSS, heading wrapping (e.g., `text-wrap: balance` or `text-wrap: pretty`).
- **How to flag:** "prose breaks clumsily at {section} — enable hyphens or use text-wrap pretty/balance."

### T11. x-height informs icon size

- **Check:** inline icons sized to ~x-height of the surrounding text, not the cap-height or full em?
- **Where to look:** icons adjacent to labels.
- **How to flag:** "oversized inline icon at {element} — match to x-height."

### T12. Uppercase carries extra letter-spacing

- **Check:** any all-caps label uses positive tracking (e.g., `letter-spacing: 0.05em`)?
- **Where to look:** tab bars, labels, section headers in caps.
- **How to flag:** "tight all-caps at {element} — add tracking."

---

## §Empty states

A first-class design surface. Posture (instructive / inviting / clinical) must match product personality.

### E1. Every list view has an empty state

- **Check:** for every component that can be empty (list, search result, inbox, dashboard), is there a designed zero state?
- **Where to look:** Storybook, routes that accept a filter query, freshly seeded environment.
- **How to flag:** "missing empty state at {surface} — current rendering: {observed, e.g., blank box}."

### E2. Empty state posture matches product

- **Check:** does the empty state's tone match the product's personality (instructive for productivity tools, inviting for consumer, clinical for enterprise)?
- **Where to look:** empty state copy and illustration.
- **How to flag:** "empty state posture mismatch at {surface}: copy reads {tone}, product is {tone}."

### E3. Empty state offers a next action

- **Check:** does the empty state include a primary action or a clear path forward?
- **Where to look:** empty states in action-driven surfaces (projects, files, messages).
- **How to flag:** "empty state is a dead end at {surface} — add primary action or path."

### E4. Error and empty are distinguished

- **Check:** does "nothing to show" read differently than "something went wrong"?
- **Where to look:** error states, filtered-to-zero states.
- **How to flag:** "empty and error collapse at {surface} — differentiate copy and shape."

### E5. Loading is designed, not a spinner

- **Check:** does the loading state preserve layout (skeletons) or at least signal duration expectation?
- **Where to look:** list / detail surfaces during initial load.
- **How to flag:** "bare spinner at {surface} — replace with skeleton or progress cue."

---

## §Motion

Purpose over decoration. Short (< 200ms) for feedback, longer only for spatial continuity.

### M1. Motion earns its place

- **Check:** does each animation communicate a change, relationship, or affordance — or is it decoration?
- **Where to look:** hover transitions, page transitions, reveals.
- **How to flag:** "decorative motion at {element} — either remove or tie to a state change."

### M2. Feedback is fast

- **Check:** interaction feedback (button press, toggle) under 200ms?
- **Where to look:** `transition-duration` on interactive elements.
- **How to flag:** "sluggish feedback at {element}: {duration} — cap ≤ 200ms."

### M3. Spatial moves are slower, eased

- **Check:** page / panel transitions use longer durations (250–400ms) and easings that match physical motion?
- **Where to look:** route transitions, modal reveals, drawer pushes.
- **How to flag:** "spatial move at {element}: {duration}, {easing} — verify it carries the user."

### M4. Motion respects prefers-reduced-motion

- **Check:** is there a `@media (prefers-reduced-motion: reduce)` override?
- **Where to look:** global CSS, motion utility.
- **How to flag:** "no reduced-motion fallback — add global override."

### M5. Nothing animates on every render

- **Check:** is motion tied to user action or state change, not to component mount on every navigation?
- **Where to look:** page components, list components.
- **How to flag:** "mount-animation pollution at {element} — scope to first-mount or state-change only."

### M6. Motion personality is consistent

- **Check:** does the easing feel coherent across the product (all crisp, all bouncy, all soft)?
- **Where to look:** grep easing values; sample three random surfaces.
- **How to flag:** "motion personality drift: {surface A} uses {easing}, {surface B} uses {easing}."

---

## §Progressive disclosure

Complexity revealed on demand. Default surface shows the 80% path.

### PD1. Default view serves the 80% case

- **Check:** does the default surface expose only what most users need most of the time?
- **Where to look:** toolbars, settings panels, forms.
- **How to flag:** "default view overloaded at {surface}: exposes advanced controls by default."

### PD2. Advanced paths are discoverable without being loud

- **Check:** can an expert user find advanced controls (without them cluttering the default view)?
- **Where to look:** "More", "Advanced", overflow menus, settings subsections.
- **How to flag:** "advanced controls buried or absent at {surface}."

### PD3. Disclosure doesn't hide the essential

- **Check:** is anything required to complete the primary task hidden behind a click?
- **Where to look:** forms with collapsed sections, checkout flows.
- **How to flag:** "essential control hidden at {surface}: {control} is required but behind {disclosure}."

### PD4. Disclosed state persists intelligently

- **Check:** when a user expands an advanced section, does the state persist across sessions where it should?
- **Where to look:** collapsible panels, filter drawers.
- **How to flag:** "disclosure state resets at {surface} — persist to localStorage or user prefs."

---

## §Functional vs Perceptual Patterns (Kholmatova)

Track these separately. A change in one doesn't imply a change in the other.

### Definitions

- **Functional patterns** — how things *work*. Structural, discrete, named by role (thread panel, inbox row, settings section, filter drawer, wizard step).
- **Perceptual patterns** — how things *feel*. Ambient, continuous, named by quality (dense rhythm, calm entry, crisp feedback, quiet chrome).

Functional patterns live in `docs/design.md §Functional patterns`, with a pointer to one real component in code. Perceptual patterns live in `docs/design.md §Perceptual patterns`, with a pointer to one real surface that exemplifies the feel.

### FP1. Each functional pattern maps to real code

- **Check:** does every entry in `§Functional patterns` point to a concrete component or directory in the codebase?
- **Where to look:** `docs/design.md §Functional patterns` citations.
- **How to flag:** "uncited functional pattern: {entry} has no code reference."

### FP2. Each perceptual pattern points to a real surface

- **Check:** does every entry in `§Perceptual patterns` cite a real view where the feel lives?
- **Where to look:** `docs/design.md §Perceptual patterns` citations.
- **How to flag:** "uncited perceptual pattern: {entry} has no surface reference."

### FP3. Functional pattern names describe role, not appearance

- **Check:** are functional patterns named by what they do (inbox-row) or what they look like (gray-box)?
- **Where to look:** `§Functional patterns` entries.
- **How to flag:** "appearance-named functional pattern: {entry} — rename by role."

### FP4. Perceptual pattern names describe quality, not implementation

- **Check:** are perceptual patterns named by the feeling (quiet chrome, crisp feedback) or the mechanism (0.15s ease-out)?
- **Where to look:** `§Perceptual patterns` entries.
- **How to flag:** "mechanism-named perceptual pattern: {entry} — rename by feel."

### FP5. No entry lives in both sections

- **Check:** does any single pattern appear as both functional and perceptual? They should be split.
- **Where to look:** cross-reference the two sections.
- **How to flag:** "pattern duplicated across functional and perceptual: {entry} — split."

---

## §Responsive behavior

Breakpoints serve content, not device categories. Test at awkward widths.

### R1. Breakpoints are content-driven

- **Check:** are breakpoints justified by the content (e.g., 3-col grid breaks below 900px) or by device names (phone / tablet / desktop)?
- **Where to look:** media queries, Tailwind config, layout files.
- **How to flag:** "device-named breakpoints at {file} — justify by content width."

### R2. Awkward widths render gracefully

- **Check:** does the layout survive at 420px, 680px, 820px, 1180px — not just the designed breakpoints?
- **Where to look:** responsive devtools; drag the viewport.
- **How to flag:** "awkward-width break at {element}: {width} — {observed, e.g., overlap}."

### R3. Touch targets ≥ 44×44 on touch surfaces

- **Check:** are all tappable elements at least 44×44 logical pixels on touch-capable contexts?
- **Where to look:** buttons, icon links, checkboxes.
- **How to flag:** "undersized touch target at {element}: {size}."

### R4. Content order reflows sensibly

- **Check:** at narrow widths, does the content order still convey the hierarchy, or does it collapse to a scroll dump?
- **Where to look:** mobile view of complex desktop layouts.
- **How to flag:** "reflow dumps hierarchy at {surface} on narrow widths."

### R5. Images and media scale down cleanly

- **Check:** do images maintain aspect ratio, avoid overflow, and use appropriate srcset where available?
- **Where to look:** `<img>` tags, background images.
- **How to flag:** "image overflow at {element} on narrow widths."

---

## How to cite a flag in output

Every finding in Capture or Review output follows this shape:

> **§{Section} > {Heuristic ID or Name}** — *{file:line or element}* — {one-line observation} → *fix:* {proposed change}.

Example:

> **§Contrast > C1 (Medium on medium)** — *HelperText.tsx:12* — uses `text-gray-500` on `bg-gray-100` in form fields → *fix:* demote bg to gray-50 or push fg to gray-600.

If a finding cannot map to a specific heuristic, do not invent one — drop it or rework it until it fits a named check. Heuristics are the skill's vocabulary; uncited criticism is slop.
