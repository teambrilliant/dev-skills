---
name: implement-change
description: Implement code changes from a ticket or technical plan. Use when someone says "implement this", "build this", "code this ticket", "implement the plan", or has a defined piece of work ready for coding. Takes groomed tickets or implementation plans and produces working code.
---

# Implement Change

Execute implementation from a ticket or technical plan, producing working code changes.

## Principles

- **Understand before coding** - Read all relevant files fully first
- **Phase by phase** - Complete one phase before starting the next
- **Verify as you go** - Run checks after each phase, fix issues before proceeding
- **Adapt to reality** - Plans are guides, not rigid scripts; handle mismatches thoughtfully
- **Track progress** - Keep todos updated, check off items as completed

## Input Types

**With a plan** (from implementation-planning):
- Follow the phases and changes specified
- Use the plan's verification steps

**With just a ticket** (from backlog-grooming):
- Read the acceptance criteria
- Explore the codebase to understand where changes go
- Implement to satisfy each criterion

## Process

### 1. Understand the Work

```
Read the ticket/plan completely
Read all files mentioned or related
Create a todo list tracking each piece of work
```

If a plan exists with checkboxes, check for existing `[x]` marks - resume from first unchecked item.

### 2. Implement Phase by Phase

For each phase or acceptance criterion:

1. **Implement** - Make the code changes
2. **Verify** - Run the specified checks (tests, typecheck, lint)
3. **Fix** - Address any failures before moving on
4. **Update** - Mark todos complete, check boxes in plan file

### 3. Handle Mismatches

When reality differs from the plan:

```
Issue in Phase [N]:
Expected: [what the plan says]
Found: [actual situation]
Why this matters: [explanation]

How should I proceed?
```

Don't silently deviate - surface the issue and get guidance.

### 4. Final Verification

After all phases complete:
- Run full test suite
- Run typecheck and lint
- Verify the original acceptance criteria are met
- Commit changes (if requested)

## Working Guidelines

**Do:**
- Read files fully (no limit/offset)
- Follow existing code patterns in the codebase
- Keep changes focused on the ticket scope
- Update progress frequently

**Don't:**
- Make unrelated "improvements"
- Skip verification steps
- Proceed past failures without fixing them
- Assume - ask when unclear

## Progress Tracking

Use todos to track:
- Each phase or major change
- Verification steps
- Any blockers or questions

Update the plan file checkboxes as you complete items:
```markdown
- [x] Completed item
- [ ] Pending item
```

## Resuming Work

If picking up existing work:
- Check for `[x]` marks in the plan
- Trust completed work unless something seems wrong
- Start from first unchecked item
- Verify previous work only if you hit unexpected issues

## Output

Implementation produces:
- Working code changes
- All tests passing
- Checkboxes updated in plan (if applicable)
- Ready for commit/PR (if requested)
