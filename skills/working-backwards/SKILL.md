---
name: working-backwards
description: >-
  Write a PR-FAQ to pressure-test a product idea customer-first — before committing engineering. Use
  when someone says "write a PR-FAQ", "press release", "working backwards", "PRFAQ", "start from the
  customer", "what's the press release for this", "before we build this", "is this idea clear enough
  to build", "draft the launch announcement", or has a fuzzy product idea and wants to force clarity
  on what to build and why. Amazon's Working Backwards method: define the desired customer experience
  as a mock press release + FAQ, iterate on the document until the thinking is clear, and kill weak
  ideas cheaply on paper. Sits between product-thinker (should we?) and shaping-work (what exactly?),
  alongside product-discovery (will it work?) — this skill answers "what is the customer-facing
  end-state, stated so plainly that the holes show?" NOT for validating risky assumptions with
  experiments (use product-discovery), NOT for breaking shaped work into a build plan (use
  shaping-work / implementation-planning).
---

# Working Backwards

Start from the customer and the desired end-state, write it down, and iterate on
the *document* until the thinking is clear — long before any engineering. The
artifact is a **PR-FAQ**: a one-page mock press release + an FAQ of the hard
questions. Most PR-FAQs are never built — **killing a weak idea cheaply on paper
is the point, not a failure.**

Why writing: prose forces clarity that slides and good intentions can't. If you
can't write a compelling, honest press release for it, you don't understand it
yet — and neither will the customer.

References:
- `references/pr-faq-template.md` — the press-release + FAQ structure, section by section.
- `references/six-page-narrative.md` — the prose-memo / silent-read discipline (for proposals & reviews beyond a launch).
- `references/input-metrics.md` — input-vs-output metrics, DMAIC, the WBR (how you'd *measure* it once live).

## When to use this vs. its neighbors

- **product-thinker** decided *should we?* → use Working Backwards to force the *customer end-state* into focus.
- Idea is fuzzy / stakeholders disagree on what it even is → write the PR-FAQ; the draft surfaces the disagreement.
- The risk is "will this technically/behaviorally work?" → that's **product-discovery** (experiments), not this.
- The PR-FAQ is approved and clear → hand to **shaping-work** to define the work.

## The method

1. **Write the press release first** (customer-benefit-first, < 1 page). Use the
   template. Write it as if it already launched. The customer's *problem* and the
   *benefit* lead — not the technology.
2. **Write the FAQ** (≤ 5 pages). Put the *hard* questions in, the ones that
   could kill it: market size, per-unit economics, dependencies & third-party
   risk, feasibility, what has to be true. The FAQ is a **pre-mortem on your own
   idea** — if you skip the uncomfortable questions, the document is dishonest.
3. **Iterate as a document.** Circulate; open the meeting with a **silent read**;
   take general feedback first, then line-by-line; **seniors speak last** (no
   anchoring). Expect 10+ drafts. Revise from the criticism, not around it.
4. **Decide: build / kill / keep iterating.** A PR-FAQ that can't be made
   compelling and honest is a *cheap save* — kill it here, not after a quarter of
   engineering.

## Output

A **PR-FAQ** (press release + FAQ, from the template) and a clear **verdict**.
Close with the signature block:

```
`★ Working Backwards View ────────────────────────`
- Customer + benefit: [who, and the one-line win]
- Verdict: [build / kill / iterate] — [why in one line]
- Biggest hole: [the FAQ question most likely to kill it]
`─────────────────────────────────────────────────`
```

## Handoffs

- Verdict = build, but a key assumption is unproven → `product-discovery` (test it cheaply first).
- Verdict = build, and it's clear → `shaping-work` (define the work), then `implementation-planning`.
- Need to re-litigate *whether* to build at all → `product-thinker`.
