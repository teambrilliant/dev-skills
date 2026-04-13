---
name: shaping-work
description: Shape rough ideas into clear, actionable work definitions. Use this skill whenever someone has an unstructured idea that needs to become a concrete work definition — feature requests, bug reports, PRDs, customer feedback, Slack threads, stakeholder asks, or vague "we should do X" statements. Trigger phrases include "shape this", "scope this", "write a PRD", "define this work", "turn this into a ticket", "flesh this out", "spec this out", "what should we build for X", "I have an idea for...", or any rough input that needs structure before implementation can begin.
---

# Shaping Work

Shape ambiguous ideas into clear work definitions. Focus on clarity, not process theater.

## Principles

- **No jargon** — write so anyone can understand
- **Product-focused** — define *what*, not *how* to build it
- **Right level of detail** — enough to act on, not a specification
- **Flag unknowns with recommendations** — surface risks early, but always propose a resolution

## Process

1. **Understand the request** — Read the input (could be anything: a Slack thread, a rough idea, a customer complaint, a formal PRD, or a handoff from product-thinker). If intent is unclear, ask up to 3 targeted questions, then shape with stated assumptions.
2. **Understand the context** — If handed off from product-thinker, use the product context and analysis already gathered (don't re-explore). Otherwise, if working in a codebase, read CLAUDE.md or similar to understand what the application does (the product, not technical details).
3. **Shape the work** — Write the definition using the output format below. Pick the template variant that fits the type of work.
4. **Surface unknowns with recommendations** — For every unknown, propose a recommended resolution and list discarded alternatives with reasoning. Never ask "what do you want?" — propose what you'd do and why.
5. **Save the document** — Save to `thoughts/research/YYYY-MM-DD-descriptive-name.md`.

## Output Format

**Always open with a Shaped View block** — a compact ASCII overview of what was shaped. This signals shaping was applied and gives an instant high-level picture without scrolling through the full document:

```
`★ Shaped View ───────────────────────────────────`
[problem] → [solution]
  ├─ [key flow or behavior 1]
  ├─ [key flow or behavior 2]
  └─ [key constraint or open question]
`─────────────────────────────────────────────────`
```

Rules for the block:
- Appears **first**, before the full shaped document
- One `[problem] → [solution]` line, then 2-4 tree branches max
- The entire block should fit in one screen — if you need to scroll, it's too long
- Use ASCII tree characters (`├─`, `└─`) for structure

Then continue with the full shaped document below.

The core structure adapts to the type of work. Always include: title, description, acceptance criteria, and risks/unknowns. The middle sections flex based on what you're shaping.

### Feature work

```markdown
## [Clear, descriptive title]

[1-2 sentence description of what this feature does, who it's for, and why it matters]

### Acceptance Criteria

- [Observable behavior, not implementation detail]
- [What triggers this feature/flow]
- [What the user sees or experiences]
- [Key states and edge cases]

### Designs

[Link to Figma/designs if provided, or "N/A"]

### Risks & Unknowns

- **[Question or risk]**
  Recommend: [option] — [why]
  Discarded: [option] ([why not])
```

### Bug fix

```markdown
## Fix: [what's broken]

[1-2 sentence description of the bug and its user impact]

**Current behavior**: [what happens now]
**Expected behavior**: [what should happen]
**Reproduction**: [steps or conditions to trigger]

### Acceptance Criteria

- [The specific broken behavior that should be fixed]
- [Any related edge cases to verify]

### Risks & Unknowns

- **[Unclear scope, possible regressions, missing reproduction info]**
  Recommend: [option] — [why]
  Discarded: [option] ([why not])
```

### Improvement / tech debt

```markdown
## Improve: [what's being improved]

[1-2 sentence description of the improvement and why it matters now]

**Current state**: [what exists today and what's wrong with it]
**Desired state**: [what it should look like after]

### Acceptance Criteria

- [Measurable outcomes — what changes for the user or the system]

### Risks & Unknowns

- **[Migration concerns, backwards compatibility, scope creep]**
  Recommend: [option] — [why]
  Discarded: [option] ([why not])
```

Use the variant that fits best. For work that doesn't fit neatly, adapt — the acceptance criteria and risks sections are the essential parts.

## Examples

### Small work (single ticket)

**Input**: "We need to show users how many items are in their cart in the header"

**Output**:

```markdown
## Cart item count in header

Display a badge on the cart icon so shoppers can see how many items are in their cart without opening it.

### Acceptance Criteria

- Display a numeric badge on the cart icon in the site header
- Badge shows total quantity of items (not unique products)
- Badge is hidden when cart is empty (not "0")
- Count updates immediately when items are added/removed
- Badge is visible on all pages where the header appears

### Designs

N/A — follow existing badge patterns in the UI

### Risks & Unknowns

- **Should the count persist across sessions for logged-out users?**
  Recommend: Yes, use localStorage — users expect cart to survive tab close.
  Discarded: Server-side session (adds auth dependency for anonymous users)
- **Max display value for large carts?**
  Recommend: Show "99+" — standard e-commerce pattern, avoids layout overflow.
  Discarded: Unlimited display (breaks layout at 4+ digits)
```

### Bug fix

**Input**: "Users are complaining that the search doesn't find products by SKU"

**Output**:

```markdown
## Fix: search doesn't match product SKUs

Users expect to find products by entering a SKU in the search bar, but search currently only matches product names and descriptions.

**Current behavior**: Searching "SKU-12345" returns no results even when the product exists.
**Expected behavior**: SKU search returns the exact matching product.
**Reproduction**: Go to search → enter any valid SKU → observe zero results.

### Acceptance Criteria

- Search matches against the product SKU field in addition to name/description
- Exact SKU match ranks first in results
- Partial SKU matches are included but ranked lower

### Risks & Unknowns

- **Does the search index include the SKU field?**
  Recommend: Check index schema first — if SKU is missing, add it and rebuild. Rebuild is cheap if index is small.
  Discarded: Separate SKU lookup endpoint (fragments search UX into two paths)
- **Are SKUs unique across all product types?**
  Recommend: Treat as unique — if duplicates exist, return all matches ranked by relevance.
  Discarded: Error on duplicate (punishes the user for a data quality issue)
```

### Larger work (PRD-style)

**Input**: "Partners aren't completing onboarding. We want to remind them."

**Output**:

```markdown
## Onboarding reminder modal

Display a reminder modal when a Partner logs into the Back Office without completing all onboarding steps. Partners who don't complete onboarding can't start earning — the modal lists what's missing and guides them to finish.

### Acceptance Criteria

**When it appears:**
- Partner logs into Back Office
- Partner has at least one incomplete onboarding step

**Modal content:**
- Title: "Complete Your Profile To Start Earning"
- Supporting text: "You're just a step away from unlocking your Back Office and getting paid."
- Dynamic list of incomplete steps with clear labels:
  - Missing DOB → "Add your Date of Birth"
  - Missing SSN → "Add your SSN"
  - Missing Bank Info → "Add bank details"
- Primary button: Takes user to Settings page to complete info
- Close/dismiss icon to skip for now

**Behavior:**
- Modal appears on each login until onboarding is complete
- Dismissing the modal does not block access to the Back Office

### Designs

[Link to Figma designs]

### Risks & Unknowns

- **Should we limit how often the modal appears?**
  Recommend: Show every login — onboarding completion is a business requirement, not a preference. Dismissing = "not now", not "never".
  Discarded: Once per day (risks Partners forgetting entirely), once ever (defeats the purpose)
- **What happens if a Partner dismisses repeatedly?**
  Recommend: No escalation — the modal is already the nudge. If they dismiss 10 times, they have a reason. Don't punish.
  Discarded: Escalating banner (adds annoyance without addressing root cause of non-completion)
- **Are there any steps that should block Back Office access entirely?**
  Recommend: No blocking — partial access is better than no access. Partners who can see their dashboard are more motivated to complete onboarding.
  Discarded: Hard block after SSN/bank (creates support burden, Partners call asking why they're locked out)
```

## Design Thinking

When shaping, consult [references/software-design-philosophy.md](references/software-design-philosophy.md) for principles that help define work in ways that avoid unnecessary complexity. Key lenses: define errors out of existence, design the common case to be simple, flag information leakage risks.

## What NOT to include

- Technical implementation details (database schemas, API designs, code patterns)
- Time estimates or sprint planning
- Assigned developers or teams
- Detailed test cases (those come later)

Keep it focused on *what* needs to exist and *why*, not *how* to build it.

## Handoffs

- Shaped work feeds into `/dev-skills:implementation-planning` for technical design.
