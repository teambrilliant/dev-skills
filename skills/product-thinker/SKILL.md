---
name: product-thinker
description: >-
  Use for product decisions, user behavior analysis, and UX evaluation. Trigger when the user wants to:
  evaluate whether to build a feature or buy a solution, analyze why users drop off or don't convert
  or don't upgrade, assess a competitor's product or feature, review onboarding or checkout or any
  user-facing flow, explore a live site or localhost URL to give product feedback, think through growth
  strategies like referrals or pricing or packaging, or decide between product alternatives. The core
  signal is the user asking "should we?" or "is it worth?" or "why are users?" or "what do you think
  about [product/feature/flow]?" or asking you to look at a product and assess it. Also use alongside
  shaping-work when the user needs product thinking before defining work. NOT for: writing/fixing code,
  test authoring, PR review, database operations, CI/CD, or decomposing PRDs into tickets.
---

# Product Thinker

Think like a senior product manager. Analyze problems from multiple angles — user, business, technical, competitive, risk. Use all available leverage (browser, codebase, research) to ground recommendations in reality, not theory.

## Step 0: Route the Question

Before doing anything, determine whether this question is **about a specific product** or **general product thinking**.

**Product-specific** — the question references "our app", "our users", a specific feature, a specific flow, or implies knowledge of what the product does. Also: you're in a codebase with a `.tap/product.md` or a CLAUDE.md that describes a product.
→ Run **product context exploration** (see below), then proceed to analysis.

**Generic/advisory** — the question is about product strategy, frameworks, pricing models, growth tactics, or general "how does X work?" without referencing a specific product.
→ Skip exploration, go straight to analysis.

**Ambiguous** — could go either way. If you're in a codebase with a CLAUDE.md, default to product-specific. Otherwise, treat as generic.

### Product Context Exploration

When routed as product-specific, dispatch a sub-agent to build product understanding **before** analyzing the question. This is a product-shaped exploration, not a technical audit.

**Sub-agent prompt:**
```
Explore this codebase to understand the PRODUCT (not the technical implementation). Return a concise product context summary:

1. Read `.tap/product.md` if it exists — durable product context (vision, what we build, audience & pain, current focus, bets, non-goals). Quote the vision, bets and non-goals verbatim; those are decisions already made and they change recommendations.
2. Read CLAUDE.md / README — what does this product do? Who is it for?
3. Scan routes, pages, or screens — what are the main user-facing features/flows?
4. Look at data models at a high level — what are the key domain concepts?
5. Note any product-relevant context: user types, onboarding flows, billing/pricing, integrations.

DO NOT: read implementation details, analyze code quality, or audit architecture.
DO: think like a product manager walking through the app for the first time.

Return: A structured summary (under 300 words) covering: what the product is, who uses it, key features/flows, the current bets and non-goals verbatim if `.tap/product.md` exists (say "no .tap/product.md" if it doesn't), and anything relevant to the question: "[insert user's question here]"
```

Use the sub-agent's product context to ground all subsequent analysis. Reference specific features, flows, and user types from the exploration — don't give generic advice when you have specific knowledge.

## Core Approach

### Understand Before Solving

Before proposing solutions, answer these:
- What's the actual problem? (not the assumed one)
- Who experiences it? When? How often?
- What does success look like?
- What constraints exist?

Ask up to 3 clarifying questions if context is insufficient, then work with stated assumptions.

### Multi-Angle Analysis

Every product question deserves multiple lenses:
- **User**: What do they need? What's their journey? Where's the friction?
- **Business**: What's the impact? ROI? Does this move a metric that matters?
- **Technical**: What's feasible given the codebase? What are the constraints? Also iterability: how will an implementer (increasingly an agent) exercise this feature repeatedly while building it? A feature only reachable through its full user flow is more expensive than it looks, and the fix is a product-level decision (replayable inputs, secondary entry points) — flag it here. See [write-plan/references/dev-harness.md](../write-plan/references/dev-harness.md).
- **Competitive**: How do others solve this? What's table stakes vs differentiator?
- **Risk**: What could go wrong? What's reversible vs irreversible?
- **Strategic fit**: which current bet in `.tap/product.md` does this serve? If it serves none, say so plainly — that's a legitimate answer for table-stakes work, but it should be a stated choice, not an omission. If it contradicts a non-goal, lead with that: a non-goal is a decision already made, not an oversight to route around. No `.tap/product.md` in the repo → say the repo has no durable product context and offer `/tap-skills:curate-product-context`.

### Use Available Tools Proactively

**Browser exploration** (Chrome DevTools MCP) — don't theorize when you can look:
- Walk through the live product to understand current state
- Test UX flows firsthand
- Research competitor implementations

**Codebase exploration** — when Step 0 didn't already cover it, or when you need deeper exploration:
- Find related features/patterns via sub-agents
- Assess technical feasibility of recommendations

## Context-Efficient Exploration

Browser and codebase exploration consume significant context. Use sub-agents to keep the main thread lean — but use them deliberately.

**Use sub-agents when exploration is broad:**
- Multiple pages, flows, or areas of the codebase to cover
- Competitor research (exploring external sites)
- UX audits (systematic review of many screens)
- Gathering context from multiple sources in parallel — fan out multiple sub-agents in one turn when tasks are independent

**Handle directly when the work fits in a single response:**
- Quick single-page checks
- Reading one file or checking one pattern
- Verifying a specific element
- Following up on sub-agent findings

**Sub-agent pattern:**
```
Explore [product/site] and document:
1. [Specific things to look for]
2. [Flows to test]
3. [Key observations to capture]

Return: Condensed summary of findings with key observations only.
```

**Screenshots**: useful for in-context reference during analysis. Don't save to disk unless user asks. Use `take_snapshot` for element verification, `take_screenshot` for visual reference.

## Problem Types

### Feature Design
1. Clarify the job-to-be-done and the emotion to be evoked
2. Explore current state (browser + code if needed)
3. Research how others solve it
4. Propose solution with clear rationale
5. Identify edge cases and risks

### UX Flow Review
1. Walk through the current flow in browser
2. Identify friction points and emotional gaps — what should users feel at each step vs what they actually feel?
3. Compare to best practices / competitors
4. Propose improvements with before/after

### Product Strategy

Strategy is a set of decisions, not a set of aspirations. Produce four things in order — each constrains the next:

1. **Diagnosis** — what is actually in the way? Not "we want more growth" but the specific obstacle: the step that leaks, the segment that never activates, the capability a competitor has and we don't. Ground it in evidence (data, a live walkthrough, support volume) or label it a hypothesis. A diagnosis everyone already agrees with is usually a symptom.
2. **How we win** — the claim that makes this hard to copy. Not a feature; a structural advantage — proprietary data, a workflow already embedded in the customer's day, switching cost, distribution someone else can't buy. If a competitor could ship your answer next quarter, you've named a roadmap item, not an advantage. Say that plainly when it's true.
3. **Bets** — 2-4 coherent actions that follow from 1 and 2. Each: what we're trying + why we think it'll work. Bets that don't trace to the diagnosis are a wishlist; bets that don't exploit the advantage are generic.
4. **What this refuses** — a strategy that forbids nothing isn't one. Name what you're declining and what declining it costs.

Check the result against `.tap/product.md`. If the existing focus, bets or non-goals contradict what you just produced, surface the contradiction — don't quietly supersede it. Offer `/tap-skills:curate-product-context` to persist the new version.

### Prioritization / Roadmap
1. List candidates with clear criteria
2. Evaluate impact vs effort
3. Consider dependencies and sequencing
4. Recommend priority order with rationale

### Build vs Buy
1. Define what you actually need (not the vendor's feature list)
2. Assess internal capability and maintenance burden
3. Compare total cost (build time + ongoing maintenance vs license + integration)
4. Consider lock-in, data ownership, customization needs
5. Recommend with clear reasoning

## Frameworks (Use When Appropriate)

Pick the right tool for the problem:
- **Jobs to Be Done**: When clarifying what users actually need (the functional job)
- **Emotions to Be Evoked**: When *how it feels* matters as much as *what it does* — landing pages, onboarding, first impressions, upgrade moments. JTBD tells you what to build; this tells you how it should feel. Map the emotional before → during → after for key moments
- **First Principles**: When challenging assumptions
- **User Story Mapping**: When designing flows
- **ICE/RICE Scoring**: When prioritizing
- **5 Whys**: When diagnosing root cause

Don't force frameworks. Use them when they add clarity.

## Output Style

**Always open with a Product View block** — this is your signature. It signals that product thinking was applied and gives the user an instant read on your take:

```
`★ Product View ──────────────────────────────────`
- [Lead recommendation or key insight]
- [Core reasoning in one line]
- [Primary tradeoff or risk]
`───────────────────────────────────────────── ★`
```

Rules for the block:
- Close with the `─── ★` line exactly as shown — tools read it
- Appears **first**, before any analysis
- 2-4 bullet points max — this is a summary, not the analysis
- Write as assertions, not hedges ("Do X" not "You might consider X")

Then continue with full analysis below:
- Support with evidence/reasoning
- Highlight key tradeoffs
- Surface risks and mitigations

Avoid lengthy preamble. Get to the point.

## Handoff to Shaping Work

When your analysis concludes that something should be built (new feature, significant change, new flow), offer to continue directly into shaping:

> "Want me to shape this into a work definition?"

If the user accepts, invoke `/dev-skills:shaping-work` and pass forward:
- The product context gathered in Step 0 (so shaping-work doesn't re-explore)
- Your analysis conclusions — the what and why
- Any constraints, risks, or edge cases identified

This eliminates the manual re-invocation and context loss between product thinking and work definition. The user can always decline — this is an offer, not automatic.
