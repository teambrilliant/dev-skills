`★ Strategic View ────────────────────────────────`
- No. Turn the monolith into a modular monolith with enforced internal boundaries (Packwerk or Rails engines). Only pull out as a separate service the one component that has a real runtime, scaling, or compliance reason to live apart.
- Services fix the problem of many teams colliding in one codebase. Three people are one team, so splitting swaps cheap in-process calls for expensive network, deploy, data and on-call work.
- The biggest risk is "this quarter." A split that's half done when the quarter ends leaves you with a distributed monolith, which is worse than either end state. Splitting the database is the step you can't take back.
`───────────────────────────────────────────── ★`

**Approach:** comparing the options. No exploration; this is pure tradeoff reasoning.

### What the split actually costs a 3-person team

- **Ops work multiplies with each service:** deploy pipeline, monitoring and tracing, secrets, versioning, local dev setup, on-call. Three people on N services means each person owns several services and is on call for all of them.
- **Data:** a join or transaction across modules becomes eventual consistency, sagas and retries. Most of the effort and risk sits here, not in moving code.
- **Who owns what:** systems end up shaped like the teams that build them. Three people talk to each other all day, so service boundaries give them no independent ownership. They add coordination steps and nothing else.
- **Build loop:** one Rails test suite gives you, or an agent, a fast and complete feedback loop. With services you need contract tests, multi-service fixtures, or a full environment to check a change. The loop gets slower, so you iterate less, so quality drops.
- **Knock-on effect:** ops load grows, product work shrinks, delivery pressure builds, people cut corners on the new infrastructure, and incidents eat even more capacity. That spiral is self-reinforcing.

### Options

| | Feasibility (3 ppl, 1 qtr) | Reversibility | Iterability | Org fit |
|---|---|---|---|---|
| **A. Full split** | Low. Realistic end state is a partial split | Hard. Splitting the database is one-way | Worst | Bad: solves a multi-team problem you don't have |
| **B. Modular monolith** (Packwerk/engines, boundary checks in CI) | High. Can be done step by step next to feature work | Easy. Boundaries are in-process; revert or relax a rule | Unchanged (fast) | Good |
| **C. Extract one hotspot** | Medium. One service is manageable | Medium. Strangler pattern behind a facade; switching traffic is the rollback | Slower only on that edge | OK if the reason is real |
| **D. Fix the actual pain directly** (parallel CI, separate worker processes, read replicas, caching) | High | Easy | Better | Good |

**Recommendation: B + D, with C only if it's earned.**

- Name the specific pain first. It's usually one of: a slow test suite, deploys tied together, one hot path that needs scaling, or tangled code. Every one of these has a fix much cheaper than services:
  - Slow tests → parallelize CI.
  - Scaling → run Sidekiq workers or a separate web process from the same codebase.
  - Tangled code → Packwerk boundaries.
- Packwerk boundaries are also how you prepare for a future split. Each package gets a public API, and the CI violation count gives you a running measure of how coupled the code is. If you extract something later, it's an expand-contract migration on a boundary you've already tested. You don't have to discover the boundary during the migration.
- C qualifies only for something with a different runtime profile (e.g. Python ML inference, media processing, high-volume ingest) or a compliance need for isolation (e.g. PCI scope). Extract that one component; leave the rest alone.

**What would change my answer:**
- Hiring to 10–15 engineers within a year, with separate teams planned. Still do B now; the package boundaries become the team and service seams later.
- A hard compliance or isolation requirement → C for that component.
- The monolith literally can't scale on a resource that horizontal Rails processes can't cover → C.

> **Key assumption:** the pain behind this question is development speed or code entanglement, not one component with fundamentally different runtime, scaling or compliance needs. If it's the latter, extract that one piece and leave the rest as is.

Next step could be `/dev-skills:shaping-work`, either to name the specific pain or to define the first Packwerk boundaries.
