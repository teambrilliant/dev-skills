---
name: product-discovery
description: >-
  Validate whether a product idea is worth building before committing engineering investment. Use when
  someone says "should we build this", "validate this idea", "discovery", "run an experiment", "test
  this hypothesis", "what are the risks", "is this worth building", "feasibility check", "prototype
  plan", or when a team has a shaped feature or product idea and needs to assess risks and design
  experiments before building. Sits between product-thinker (should we?) and shaping-work (what
  exactly?) — this skill answers "will this actually work?" by identifying what you don't know,
  designing the cheapest way to find out, and defining evidence gates that justify (or kill) the
  investment. Also trigger when someone has a feature request and you sense high uncertainty — if
  the team is about to spend weeks building something nobody tested, this skill should intervene.
---

# Product Discovery

Figure out whether an idea is worth building before you commit engineering time. The goal is sufficient evidence that the solution will work — not certainty, but enough to bet responsibly.

70-90% of features built without validation fail to deliver business results. Discovery exists to catch the failures early and cheap, so engineering investment goes toward ideas with real evidence behind them.

## Core Principle

Every idea tested in discovery should cost at least one order of magnitude less than building the real thing. If engineering a feature takes 4 weeks, discovery should take days. If it takes months, discovery should take weeks.

## Process

1. Understand the idea
2. Assess the four product risks
3. Identify what you don't know
4. Design experiments
5. Define evidence gates
6. Write the discovery plan

### 1. Understand the Idea

Get clarity on what's being proposed. Read any existing artifacts — shaped work documents, PRDs, feature requests, Slack threads, customer feedback. If working in a codebase, check CLAUDE.md and related code for context.

Restate the idea as a **problem to solve** and a **desired outcome**:
- Problem: what's broken or missing for customers/the business?
- Outcome: what measurable change would success look like?

If the input is a solution ("build a self-service portal"), reverse-engineer it: what problem does the portal solve? ("Partners can't onboard without calling support, costing us $X per onboarding")

### 2. Assess the Four Product Risks

Every product idea carries four types of risk. Rate each **low / medium / high** based on what you know right now.

**Value risk** — Will customers choose to use this?
- Is there evidence of demand? (customer requests, usage data, competitor validation)
- Is the problem painful enough to change behavior?
- Will this be sufficiently better than what they have now?

**Usability risk** — Can users figure out how to use it?
- Is the interaction model novel or familiar?
- Does it require new mental models or workflows?
- Are there accessibility or learning-curve concerns?

**Feasibility risk** — Can we build and scale this?
- Are there unknown technical challenges?
- Does it depend on technology the team hasn't used?
- Are there performance, scale, or integration unknowns?

**Viability risk** — Does this work for the business?
- Does it fit the business model? Can we monetize, market, sell, support it?
- Are there legal, compliance, or ethical concerns?
- Will stakeholders (sales, marketing, finance, legal) support it?
- Are operational costs sustainable?

The risks rated **medium or high** are what discovery needs to address. Low risks don't need experiments — move on.

### 3. Identify What You Don't Know

For each medium/high risk, articulate the specific uncertainty as a testable hypothesis:

```
We believe [specific assumption].
We'll know we're right if [observable evidence].
We'll know we're wrong if [observable evidence].
```

Be honest about what you can't know without investigation. Common unknowns:

| Risk | Common unknowns |
|------|----------------|
| Value | Will customers actually switch? Is the pain big enough? |
| Usability | Can users complete the flow without help? Where do they get stuck? |
| Feasibility | Can we hit the performance target? How long will integration take? |
| Viability | Will legal approve this? Can support handle the volume? |

### 4. Design Experiments

For each hypothesis, design the cheapest experiment that produces evidence. Match the experiment type to the risk:

**Value experiments** (will they want it?):
- Customer interviews (5-10 conversations) — understand the problem space
- Fake door test — measure click-through on a feature that doesn't exist yet
- Landing page test — describe the solution, measure sign-ups or interest
- Competitor analysis — do similar solutions succeed in market?
- Data analysis — what does existing usage data suggest?

**Usability experiments** (can they use it?):
- Prototype test — clickable mockup tested with 5+ real users
- Wizard of Oz — human behind the curtain simulating the feature
- Concierge test — manually deliver the service to validate the workflow

**Feasibility experiments** (can we build it?):
- Feasibility prototype — engineers investigate the hardest technical unknowns
- Spike — time-boxed technical exploration of a specific question
- Proof of concept — minimal working version of the riskiest component

**Viability experiments** (does it work for the business?):
- Stakeholder review — show the prototype to sales, legal, marketing, finance
- Unit economics analysis — model the costs at scale
- Compliance review — get legal/regulatory feedback early

**Choosing the right experiment:**
- Pick the experiment that addresses the **highest risk** first
- If multiple risks are high, run experiments in parallel where possible
- Prefer experiments that take days, not weeks
- Prefer real customer contact over internal guessing

### 5. Define Evidence Gates

Each experiment needs a clear decision point — what result means "proceed" vs "pivot" vs "stop"?

```
### Gate: [hypothesis being tested]
Experiment: [what you'll do]
Timeline: [days/weeks]
Proceed if: [specific evidence threshold — e.g., "4 of 5 users complete the flow without help"]
Pivot if: [evidence suggests a different approach — e.g., "users want the outcome but not this method"]
Stop if: [evidence kills the idea — e.g., "0 of 10 customers express interest in the problem"]
```

Evidence gates protect the team from two failure modes:
- **Building something nobody wants** (most common — this is the 70-90% failure rate)
- **Killing a good idea too early** (pivoting counts as progress, not failure)

### 6. Write the Discovery Plan

Output a structured plan. Save to `thoughts/research/YYYY-MM-DD-discovery-[descriptive-name].md`.

```markdown
# Discovery: [idea name]

## Problem & Desired Outcome
**Problem:** [what's broken]
**Outcome:** [measurable success]
**Origin:** [where this idea came from — customer request, data insight, stakeholder ask, etc.]

## Risk Assessment
| Risk | Level | Key uncertainty |
|------|-------|----------------|
| Value | [L/M/H] | [what we don't know] |
| Usability | [L/M/H] | [what we don't know] |
| Feasibility | [L/M/H] | [what we don't know] |
| Viability | [L/M/H] | [what we don't know] |

## Hypotheses
1. [We believe X. Evidence for: Y. Evidence against: Z.]
2. [...]

## Experiments
### Experiment 1: [name]
- **Tests:** [which hypothesis]
- **Method:** [what you'll do]
- **Timeline:** [how long]
- **Cost:** [effort level — hours/days]
- **Gate:** Proceed if [X]. Pivot if [Y]. Stop if [Z].

### Experiment 2: [name]
[same structure]

## Sequence
[Which experiments to run first, which can run in parallel, dependencies between them]

## What Happens Next
- **If discovery succeeds:** Hand off to `/dev-skills:shaping-work` for detailed work definition
- **If discovery says pivot:** [what the alternative direction looks like]
- **If discovery says stop:** [document what we learned for future reference]
```

## Relationship to Other Skills

```
product-thinker  →  product-discovery  →  shaping-work  →  implementation-planning
"should we?"         "will it work?"       "what exactly?"   "how technically?"
```

- **product-thinker** analyzes problems, evaluates options, makes recommendations. It answers "should we explore this?"
- **product-discovery** takes an idea worth exploring and validates it. It answers "do we have evidence this will work?"
- **shaping-work** takes a validated idea and defines it precisely. It answers "what exactly are we building?"

If someone brings a raw idea, suggest starting with product-thinker. If they have a clear idea but high uncertainty, this is the right skill. If the idea is low-risk and well-understood, skip straight to shaping-work.

## What This Skill Does NOT Do

- Does NOT make the build/kill decision — presents evidence, team decides
- Does NOT produce implementation plans — that's implementation-planning
- Does NOT design the full solution — that's shaping-work
- Does NOT run the experiments — plans them for the team to execute
- Does NOT replace talking to customers — strongly recommends it

## Test Responsibly

For established companies with existing customers and revenue: experiments must protect the company's revenue, reputation, customers, and colleagues. When testing ideas that could affect real users, use conservative techniques — smaller sample sizes, internal users first, feature flags. The experiments are essential, but run them responsibly.
