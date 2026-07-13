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
- Each loop's verification must be observable without a human: diffable output, queryable state, snapshot — not "looks right." Where human judgment *is* the check (extraction quality, generated content), give it an instrument — see **Inspection surfaces** below.

## The four properties that buy the ladder

1. **Replayable inputs** — persist raw external input at the system boundary (uploaded file, webhook payload, fetched API response) and make everything downstream read only the stored artifact. Any run becomes re-runnable offline; a "reprocess" command falls out for free and doubles as the prod-debugging tool.
2. **Fixtures + goldens** — capture real-world inputs once as fixtures; golden outputs make every change diffable. For nondeterministic cores (LLM calls), replace exact goldens with an eval script (structural assertions, judge scoring) — the loop shape is the same.
3. **Reachability without prerequisites** — every surface reachable via a secondary entry point, seed script, or dev command. A one-time funnel (onboarding, first-run wizard) must never be the only door to a feature.
4. **One shared code path** — the L1 script calls the same use-case the production path calls. Tuning in the harness is tuning what ships; a harness that exercises a copy proves nothing.

## Inspection surfaces — observing outside the app

The ladder makes *exercising* a feature fast; a loop only closes once the result can be *observed*. Machine checks (diff, query, snapshot) are the default, but two cases need more:

1. **Human judgment is the verifier.** LLM extractions, rankings, generated content — the goldens themselves must be judged before they can be trusted, and raw JSON or DB rows are a poor judgment surface.
2. **The product surface for the data doesn't exist yet.** A pipeline writes tables or blobs whose UI ships in a later phase (or never) — the only in-app way to look at the output sits high on the ladder or behind unbuilt screens.

The move: a disposable viewer that lives *outside* the application — a single self-contained HTML file that takes the artifact via file-drop, a script that queries the new tables and renders a report, a CLI table dump. No app build, no auth, no routing. It reads the **real artifact** (the same fixture/golden files, the same DB) — never a copy.

Rules that keep it useful:

- **Instrument, not UI.** Design the view around "what would a systematic miss look like?" — failure signals should pop: distributions and counts up front, gaps in a time series rendered as explicit empty rows, buckets for unparseable values, per-field emptiness rates. Pretty rendering is the least of it.
- **Zero infrastructure.** One file or one script, no deps, no build step, colocated with the fixtures or feature. An agent builds one in minutes; anything heavier stops being disposable and starts rotting.
- **Schema-tolerant.** The artifact's shape is exactly what's being iterated on — the viewer must degrade gracefully on missing or extra fields, not crash on last week's golden.

Like all harness artifacts it's a **plan deliverable named up front** (normally phase 1), not improvised mid-debug — its findings feed the tuning loop from the first run. Throwaway by default; occasionally one graduates into an admin/debug page, but that's a bonus, not the goal.

## Scaling the investment

- **Full ladder + fixtures + goldens:** LLM/prompt pipelines, parsers of messy external input, third-party integrations, multi-step async workflows — anywhere behavior is discovered by iteration rather than specified up front. Add an inspection surface when outputs are judged rather than diffed, or land in data models with no UI yet.
- **A seed script and a direct URL may be the whole harness:** CRUD screens, simple UI. Don't build ceremony where the loop is already fast — "trivial: direct route + seeded data" is a complete answer. Same for inspection surfaces: a viewer for exact-diffable outputs, or for data the app already renders well, is ceremony.

## What's decided where

| Stage | Decides | Example |
|---|---|---|
| **Shape** | harness *requirements* | "raw upload is stored and reprocessable"; "feature reachable outside onboarding"; "these 4 real customer files become fixtures" |
| **Plan** | harness *deliverables* | script paths, fixture/golden locations, seed & reprocess commands, inspection-surface path (e.g. `viewer.html` beside the goldens) — shipped in **phase 1**, before the logic they exercise is tuned, not as cleanup |
| **Implement** | lives in the loops | tune at L1, verify at L2/L3, touch L4 once |

## Worked example

A spreadsheet-import feature whose primary entry point is an onboarding step; core is LLM extraction of arbitrarily-formatted customer calendars.

```
L1  4 real customer sheets checked in as .xlsx fixtures →
    `extract` script (calls the production use-case) → JSON → diff vs goldens;
    single-file `viewer.html` beside the goldens renders the extraction with
    judgment signals (month gaps as explicit empty rows, confidence
    distribution, unparseable-date bucket) — the review UI ships phases later
L2  import workflow re-triggered against the stored artifact
    ("reprocess import" command = same mechanism, also used in prod debugging)
L3  secondary entry point on an existing org's settings page —
    review UI testable without creating a fresh account
L4  full onboarding — exercised only to test the onboarding step itself
```

Shape-level decisions that bought this: store the raw file at submit (replayability), secondary entry points (reachability), fixtures named as an acceptance criterion. None of these were added *for* the harness — but naming the harness at shape time is what surfaced them as requirements.
