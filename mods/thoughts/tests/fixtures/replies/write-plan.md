# Hello CLI `--json` flag: implementation plan

## Overview
Add a `--json` flag to `cli.ts`. With it, the CLI prints `{"message":"hello"}` instead of `hello`, so scripts can parse the output.

## Acceptance Criteria
No shape exists, so the criteria are listed here:
1. `cli.ts` with no args prints `hello` followed by a newline and exits 0. This is the current behavior and must not change.
2. `cli.ts --json` prints one line of valid JSON, `{"message":"hello"}` followed by a newline, and exits 0.
3. `cli.ts --unknown` writes a usage error to stderr and exits non-zero.

## Current State
Assumed: one file, `cli.ts`, prints `hello` and parses no arguments. Runs under Bun. Not researched, per the request.

## Desired End State
`bun cli.ts` prints `hello`. `bun cli.ts --json | jq -r .message` prints `hello`.

## Out of Scope
- Other flags, `--help` text, and a `--pretty` option
- Moving to an arg-parsing library
- Adding a test runner

## Rollout & Rollback
**Reversibility mechanism:** neither. The JSON shape is a new contract, but it has no existing consumers, so no expand-contract is needed. No launch audience, so no flag. Deploy directly. Blast radius: one file. Rollback: revert the commit.

## Layers & Dev Harness
| Part | Layer | Proven by | Phase |
|---|---|---|---|
| Output formatting (text vs JSON) | Function | `bun cli.ts --json \| jq -e '.message == "hello"'` | 1 |
| argv parsing | inbound I/O | `bun cli.ts --bogus; echo $?` → non-zero | 1 |

**Fastest loop:** `bun cli.ts --json`
**Fixtures / Direct trigger / Inspection:** N/A
**Reachability:** run the file directly
**Pre-flight blockers:** none

**Whiteboard Defense:** skipped. This is a toy CLI with no customer reach.

## Implementation Approach
Two ways to read the flag:
- **A: `node:util` `parseArgs` with `strict: true`** (recommended). It's built in, so no new dependency. Unknown flags fail loudly instead of being ignored. New flags can be added in one line.
- **B: `process.argv.includes("--json")`.** It's shorter, but `--jsn` (a typo) would be silently ignored and plain text would come out. A consumer of a parse contract shouldn't get that.

The JSON contract is a stable object, `{ "message": string }`, not a bare string. That way fields can be added later without breaking parsers.

---

## Phase 1: `--json` flag

**Layer:** inbound I/O + Function · **Proves:** both output modes and error handling behave as the contract says

### Changes
- `cli.ts`:
  - Parse argv with `parseArgs({ options: { json: { type: "boolean" } }, strict: true })`.
  - Branch the output: `JSON.stringify({ message: "hello" })` or `"hello"`.
  - On a parse error, catch it, write the message to stderr, and exit with code 2.

### Phase Checks
- [ ] `bun cli.ts` → `hello`, exit 0
- [ ] `bun cli.ts --json | jq -e '.message == "hello"'` → `true`, exit 0
- [ ] `bun cli.ts --json | wc -l` → `1`
- [ ] `bun cli.ts --bogus >/dev/null; echo $?` → `2`, with the error on stderr
- [ ] `bunx tsc --noEmit cli.ts` → clean

---

## Final Verification
- [ ] All Phase 1 checks green; together they cover acceptance criteria 1–3.

## Open Questions
- **Should strict parsing reject args that were previously ignored?**
  - Recommend: yes, reject them. The CLI takes no args today, so the only callers affected are already passing junk.
  - Discarded: `strict: false`. A typo in the flag would silently produce text output.
- **Should errors use exit code 2 or 1?**
  - Recommend: 2, the usual code for a usage error.
  - Discarded: 1. Usage errors would be indistinguishable from runtime failures.

```
★ Plan View ─────────────────────────────────────
- Building: --json flag → {"message":"hello"} on stdout
- Approach: node:util parseArgs (strict), branch the output format
- Blast radius: 1 file (cli.ts)  ·  Rollout: direct
- Iterate via: bun cli.ts --json | jq .
- Pre-flight: none
- Risk: strict parsing now rejects stray args that used to be ignored
──────────────────────────────────────────────────

Plan: Hello CLI --json flag
│
└─ Phase 1: --json flag        [layer: inbound I/O + Function]
     ├─ cli.ts
     ├─ ✓ bun cli.ts → hello
     ├─ ✓ bun cli.ts --json | jq -e '.message == "hello"'
     └─ ✓ bun cli.ts --bogus → exit 2

Full plan → inline (no file written, per request)
───────────────────────────────────────────── ★
```
