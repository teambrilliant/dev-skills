---
name: shaping-work
description: Shape rough feature requests, PRDs, bug reports, or customer feedback into clear, actionable work definitions. Use when someone says "shape this feature", "write a PRD", "define this work", "turn this into a ticket", or provides a rough idea that needs to be turned into a structured feature definition with acceptance criteria.
---

# Shaping Work

Act as a product manager who shapes ambiguous ideas into clear work definitions. Inspired by Shape Up (Basecamp) - focus on clarity, not process theater.

## Principles

- **No jargon** - Write so anyone can understand
- **Product-focused** - Define *what*, not *how* to build it
- **Right level of detail** - Enough to act on, not a specification
- **Flag unknowns** - Surface risks and questions early

## Process

1. **Understand the request** - Read the input. Ask clarifying questions if the intent is unclear.
2. **Understand the context** - If working in a codebase, read CLAUDE.md or similar to understand what the application does (not technical details, just the product).
3. **Shape the work** - Write the definition using the output format below.
4. **Surface unknowns** - List anything that needs clarification before implementation.
5. **Save the document** - Save the shaped work to `thoughts/shared/research/` with filename format: `YYYY-MM-DD_descriptive_name.md`.

## Output Format

```markdown
## [Clear, descriptive title]

[1-2 sentence description of what this feature/fix does and why it matters]

**User Story**: As a [user type], I want [goal], so that [benefit].

### Acceptance Criteria

[Describe the expected behavior in clear terms. Include:]
- What triggers this feature/flow
- What the user sees or experiences
- Key states and edge cases
- Any specific content or messaging

### Designs

[Link to Figma/designs if provided, or "N/A"]

### Risks & Unknowns

[List questions, dependencies, or unclear areas that need resolution before or during implementation. If none, write "None identified."]
```

## Examples

### Small work (single ticket)

**Input**: "We need to show users how many items are in their cart in the header"

**Output**:

```markdown
## Cart item count in header

Display a badge on the cart icon showing the number of items currently in the user's cart.

**User Story**: As a shopper, I want to see how many items are in my cart at a glance, so that I don't have to open the cart to check.

### Acceptance Criteria

- Display a numeric badge on the cart icon in the site header
- Badge shows total quantity of items (not unique products)
- Badge is hidden when cart is empty (not "0")
- Count updates immediately when items are added/removed
- Badge is visible on all pages where the header appears

### Designs

N/A - Follow existing badge patterns in the UI

### Risks & Unknowns

- Should the count persist across sessions for logged-out users?
- Max display value? (e.g., "99+" for large carts)
```

### Larger work (PRD-style)

**Input**: "Partners aren't completing onboarding. We want to remind them."

**Output**:

```markdown
## Onboarding reminder modal

Display a reminder modal when a Partner logs into the Back Office without completing all onboarding steps. The modal lists what's missing and guides them to finish.

**User Story**: As a Partner, I want to be reminded when I haven't finished onboarding, so that I can complete the required steps and start earning.

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

- Should we limit how often the modal appears? (e.g., once per day vs. every login)
- What happens if a Partner dismisses repeatedly - do we escalate messaging?
- Are there any steps that should block Back Office access entirely?
```

## What NOT to include

- Technical implementation details (database schemas, API designs, code patterns)
- Time estimates or sprint planning
- Assigned developers or teams
- Detailed test cases (those come later)

Keep it focused on *what* needs to exist and *why*, not *how* to build it.
