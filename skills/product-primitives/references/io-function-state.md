# I/O / Function / State — Architectural Lens

A compact mental model for placing seams. Every running app has three layers — I/O, Function, State. When asking where something belongs, where to put a test boundary, or where to introduce an adapter, identify which layer the concern lives in and place the seam at that layer's edge.

## The three layers

**I/O — boundaries.** Anything that crosses the runtime/process boundary: HTTP requests and responses, network calls, file reads, timers, terminals, webhooks, message queue producers and consumers. Non-deterministic by nature.

**Function — logic.** Pure computation, decisions, orchestration. Workflows, route handlers, use-cases, business rules. Deterministic given its inputs.

**State — persistent things.** Database rows, files on disk, durable queues, caches that outlive a single request. The thing the system remembers between operations.

Data flows left-to-right during a request: I/O input → Function → State write. Results flow right-to-left: State read → Function → I/O output. State persists across requests; the others are transient.

## When to apply this lens

- "Where should this dependency live?"
- "Where do I put the test boundary / adapter / mock?"
- "This module feels mixed — what is it actually doing?"
- "Where's the right seam to swap implementations?"
- "Why does this code feel hard to test?"

It is not a workflow. It is a 30-second gut check applied during design conversations and code reviews.

## Heuristics

### Push state to the edges; keep function pure

Function-layer code should not hold mutable state across calls. If it does, the state belongs in the State layer (with a typed accessor) or shouldn't exist (refactor to be pure). Functions that read state at the top and write state at the bottom are easier to reason about than functions that thread mutable references through the middle.

### Swap at the I/O boundary, not deeper

When isolating from external systems for tests, dev environments, or provider swaps, place the seam as close to the wire as possible. Closer to I/O means higher fidelity (more real code runs in the test), smaller mock surface (you only model HTTP, not behavior), less drift between mock and real.

The opposite mistake — mocking deep inside Function — skips serialization, auth, retry logic, and error handling, which is where bugs actually live.

### Tests isolate Function from I/O and State, not the reverse

The Function layer is the thing worth testing in detail. Surround it with controllable I/O (in-memory or intercepted) and controllable State (in-memory DB or seed fixtures). Tests that primarily exercise I/O plumbing or DB connection handling are integration-level concerns, not unit-level.

### Most pain comes from misplaced concerns

- Function code calling `fetch` directly = I/O leak. The function isn't pure; it's now an integration test target.
- I/O code making business decisions = Function leak. The decision can't be reused elsewhere or tested without booting the I/O.
- Function code holding mutable state = State leak. Behavior depends on call order; the function isn't deterministic.

When code feels hard to reason about, look for these leaks first.

### Place new code by asking "which layer?"

A new feature usually has parts in all three layers. Sketch the layers, draw the data flow, place each part. Code without a clear layer probably needs splitting.

## Worked example: where to mock external APIs

**Question:** Where do we mock external APIs in our test stack?

**Lens applied:**
- I/O = HTTP fetch calls (e.g. Shopify GraphQL, third-party REST)
- Function = workflows, activities, route handlers
- State = Postgres, durable queues

**Answer: the mock belongs at I/O — the layer being isolated.**

This rules out:
- Mocking the client library (`ShopifyClient.getOrder()` stubbed) — that's inside Function. Real serialization, auth, retries, error handling don't run.
- Test doubles inside business logic — mixes layers in tests.
- Database fixtures of "what Shopify would have written" — wrong layer entirely.

This rules in:
- MSW intercepting `fetch` globally — sits exactly at I/O.
- Per-call HTTP mock servers (Mountebank, in-process Hono daemon) — also I/O, out-of-process variant.
- A typed `Fetcher` port injected at the composition root — also I/O, explicit-DI variant.

The lens does not pick which I/O-layer technique is right. It picks the layer. Other constraints (zero-app-code-changes, runtime, type safety, team familiarity) decide between MSW vs Fetcher vs mock daemon.

## Limits

This lens maps cleanly to:
- Web apps and services with persistent state
- Full-stack applications
- Long-running systems with external integrations

It is less useful for:
- Pure libraries — no I/O, no State, Function is the whole thing
- Pure CLIs — data flow is the structure, not layering
- Batch and ML pipelines — data lineage matters more than layer placement
- Embedded code — different runtime model

It does not replace hexagonal architecture, ports and adapters, clean architecture, or functional core / imperative shell. It is a faster gut-check that sits on top: when those frameworks would take a meeting, this lens gives an answer in 30 seconds.

## Red flags

- A module whose name suggests one layer but whose code does work from another. A `repository` that builds HTTP requests; a `client` that writes to a DB; a "pure" helper that reads `process.env`.
- Tests that have to start a real database to verify a pure decision.
- Mocks at multiple layers for the same concern — mock the client AND mock the fetch. Pick one layer.
- Code where "function or state?" can't be answered cleanly — usually means the abstraction is wrong, not that the lens is wrong.
- A "service" that is half I/O glue and half business logic, with both halves growing. Split it.

## Companion to the systems-thinking toolkit

This lens answers *where* something belongs. The systems-thinking toolkit (feedback loops, stocks and flows, leverage points, delay) answers *how* parts behave together over time. They compose: place a seam correctly, then reason about what happens when load, failure, or change passes through it.
