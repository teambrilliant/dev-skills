# Dev Harness — designing features for iteration

**The premise:** how fast an implementer (agent or human) can iterate on a feature is a *design property*, and it's mostly fixed before implementation starts. If the only way to exercise a feature is walking its full user flow, every attempt costs minutes of setup and browser automation — and the implementer will under-iterate exactly where the risk lives. Shift the question left: at shaping time, ask

> **How does an implementer exercise this feature a hundred times without going through the app?**

## The loop ladder

Name the loops a feature can run in, fastest first. Every feature gets a ladder; most of the tuning happens on the bottom rung.

```
L1  LOGIC LOOP       fixture in → core function → output diffed vs golden
    (seconds)        no DB, no UI, no network — where prompts, parsers,
                     and algorithms actually get tuned

L2  SERVICE LOOP     trigger the workflow / job / endpoint directly
    (seconds–min)    against stored state; verify by querying;
                     replayable without external systems

L3  SURFACE LOOP     open the UI at the feature with state seeded or
    (minutes)        via a direct entry point — no prerequisite funnel
                     (signup, onboarding, connect flows)

L4  FULL FLOW        end-to-end through the product
    (slow)           exists to validate the flow itself, nothing else
```

Rules:

- The **riskiest logic must have an L1**. If the risky part can only be exercised at L3/L4, reshape until it can't be.
- **L4 must never be the only loop.**
- Each loop's verification must be observable without a human: diffable output, queryable state, snapshot — not "looks right."

## The four properties that buy the ladder

1. **Replayable inputs** — persist raw external input at the system boundary (uploaded file, webhook payload, fetched API response) and make everything downstream read only the stored artifact. Any run becomes re-runnable offline; a "reprocess" command falls out for free and doubles as the prod-debugging tool.
2. **Fixtures + goldens** — capture real-world inputs once as fixtures; golden outputs make every change diffable. For nondeterministic cores (LLM calls), replace exact goldens with an eval script (structural assertions, judge scoring) — the loop shape is the same.
3. **Reachability without prerequisites** — every surface reachable via a secondary entry point, seed script, or dev command. A one-time funnel (onboarding, first-run wizard) must never be the only door to a feature.
4. **One shared code path** — the L1 script calls the same use-case the production path calls. Tuning in the harness is tuning what ships; a harness that exercises a copy proves nothing.

## Scaling the investment

- **Full ladder + fixtures + goldens:** LLM/prompt pipelines, parsers of messy external input, third-party integrations, multi-step async workflows — anywhere behavior is discovered by iteration rather than specified up front.
- **A seed script and a direct URL may be the whole harness:** CRUD screens, simple UI. Don't build ceremony where the loop is already fast — "trivial: direct route + seeded data" is a complete answer.

## What's decided where

| Stage | Decides | Example |
|---|---|---|
| **Shape** | harness *requirements* | "raw upload is stored and reprocessable"; "feature reachable outside onboarding"; "these 4 real customer files become fixtures" |
| **Plan** | harness *deliverables* | script paths, fixture/golden locations, seed & reprocess commands — shipped in **phase 1**, before the logic they exercise is tuned, not as cleanup |
| **Implement** | lives in the loops | tune at L1, verify at L2/L3, touch L4 once |

## Worked example

A spreadsheet-import feature whose primary entry point is an onboarding step; core is LLM extraction of arbitrarily-formatted customer calendars.

```
L1  4 real customer sheets checked in as .xlsx fixtures →
    `extract` script (calls the production use-case) → JSON → diff vs goldens
L2  import workflow re-triggered against the stored artifact
    ("reprocess import" command = same mechanism, also used in prod debugging)
L3  secondary entry point on an existing org's settings page —
    review UI testable without creating a fresh account
L4  full onboarding — exercised only to test the onboarding step itself
```

Shape-level decisions that bought this: store the raw file at submit (replayability), secondary entry points (reachability), fixtures named as an acceptance criterion. None of these were added *for* the harness — but naming the harness at shape time is what surfaced them as requirements.
