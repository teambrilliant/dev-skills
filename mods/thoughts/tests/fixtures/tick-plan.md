# Tick fixture - Implementation Plan

## Overview
Fixture for the tick-on-pass contract: two phases, four trivial checks, no code changes.

## Acceptance Criteria
1. `notes.txt` exists with two lines.

## Phase 1: Create file

**Layer:** State  ·  **Proves:** the file exists

### Changes
- `notes.txt` (new) — one line `one`

### Phase Checks
- [ ] `test -f notes.txt` → exit 0
- [ ] `grep -q one notes.txt` → exit 0

## Phase 2: Append line

**Layer:** State  ·  **Proves:** the second line is there

### Changes
- `notes.txt` — append a line `two`

### Phase Checks
- [ ] `grep -q two notes.txt` → exit 0
- [ ] `test "$(wc -l < notes.txt | tr -d ' ')" = 2` → exit 0
