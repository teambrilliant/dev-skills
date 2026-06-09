---
name: implement-change
description: >-
  Execute code changes from an implementation plan. Use when someone says "implement this",
  "build this", "code this", "start building", "let's implement", "execute the plan",
  "make the changes", "do the work", or has an approved implementation plan ready for coding.
  Takes implementation plans and produces working code, phase by phase with verification.
---

# Implement Change

Execute an implementation plan phase by phase, producing working code with verification at each step.

## Design Philosophy

While implementing, consult [references/software-design-philosophy.md](references/software-design-philosophy.md) for code-level design principles. Watch for red flags: shallow modules, information leakage, pass-through methods, temporal decomposition.

## Principles

- **Understand before coding** — read all relevant files thoroughly first
- **Phase by phase** — complete one phase before starting the next
- **Verify as you go** — run checks after each phase, fix issues before proceeding
- **Plan is the contract** — execute the approved plan; deviate only when a step is impossible or wrong, then note it. Plans guide the *how*, not a license to re-open the *what*
- **Track progress** — keep todos updated, check off items as completed
- **Sub-agents for exploration, not execution** — dispatch sub-agents to research codebase patterns or read multiple files in parallel before coding. Do not delegate code changes to sub-agents — implement directly. Fan out multiple sub-agents in one turn when gathering independent context (e.g., reading tests + reading related modules).

## Input

This skill expects an implementation plan (from `/dev-skills:implementation-planning`). If no plan exists, create one first — don't start coding without a plan.

## Execution Contract

Plan approval is the gate. Once a plan is approved, you have the authority to execute every phase to completion — **do not check in between phases for confirmation**. Verify, fix, proceed. Come back when the work is done, or when you hit something that genuinely needs the user's judgment.

**Before pausing, classify the deviation:**

**Resolve and keep going** (fix in scope, note it in passing, don't stop):
- Trivial plan-vs-reality mismatches — renamed symbol, moved file, slightly different signature, an extra import
- Minor implementation choices consistent with the plan's intent
- A phase that passed its checks — continue to the next
- "Should I keep going?" — yes

**Pause and ask** (these need the user):
- A blocker you can't clear — missing access, an ambiguous requirement that changes *what* gets built, verification you can't make pass
- A deviation that changes **scope, acceptance criteria, risk/blast-radius, or the rollout decision** (flag vs. direct, expand-contract)
- The plan's premise turns out to be false (it rests on X; X isn't true)

The discriminator: does resolving this need information or judgment only the user has, *and* would guessing risk material rework? If no — resolve it and move on.

## Process

### 1. Understand the Work

Read the plan completely. Read all files mentioned or related. Create a todo list tracking each phase.

If the plan has checkboxes, check for existing `[x]` marks — resume from first unchecked item.

### 2. Implement Phase by Phase

For each phase:

1. **Implement** — make the code changes
2. **Verify** — run the specified checks (tests, typecheck, lint)
3. **Fix** — address any failures before moving on
4. **Update** — mark todos complete, check boxes in plan file

### 3. Handle Mismatches

When a deviation lands in the **pause and ask** lane (see Execution Contract), surface it:

- What the plan says vs what you found
- Why it matters
- How you suggest proceeding

Resolve-and-keep-going deviations don't need this — fix them in scope and note what you did. Reserve the stop for material mismatches.

### Rollout discipline

Check the plan's Rollout & Rollback block before coding. Then:

- **If the plan says "direct deploy, no flag"** — do not introduce a flag mid-implementation. If implementation reveals the change is riskier than the plan assumed (touches critical path, blast radius grew), surface that to the user — flag decisions belong in planning, not in the diff.
- **If the plan says "flag"** — use the one named flag for the whole feature, at the user-perceived boundary. Do not introduce new flags per phase, per file, or per layer.
- **If the plan says "expand-contract"** — ship the phases separately. Do not collapse expand and contract into one PR; the gap between phases is where the safety lives.
- **If the plan says "both"** — flag the consumer, expand-contract the schema/API. Never "flag the schema" — flags wrap code, not storage.

See [implementation-planning/references/rollout-primitives.md](../implementation-planning/references/rollout-primitives.md) for the full decision tree.

### 4. Final Verification

After all phases complete:
- Run full test suite
- Run typecheck and lint
- Verify the original acceptance criteria are met

## Working Guidelines

**Do:**
- Read files thoroughly — full files for small ones, targeted sections for large ones
- Follow existing code patterns in the codebase
- Keep changes focused on the plan scope
- Execute approved phases to completion; pause only per the Execution Contract
- Update progress frequently

**Don't:**
- Make unrelated "improvements"
- Skip verification steps
- Proceed past failures without fixing them
- Pause for confirmation between phases, or ask about trivia you can resolve in scope
- Guess on calls that change scope, acceptance criteria, risk, or rollout — pause for those

## Progress Tracking

Use todos to track each phase, verification steps, and blockers.

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

## Handoffs

- After all phases pass verification → suggest `/dev-skills:qa-test` for browser verification
- If acceptance criteria need revision during implementation → flag it, don't modify them
