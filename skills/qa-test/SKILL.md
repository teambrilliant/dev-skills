---
name: qa-test
description: Browser-based QA verification after any implementation. Use when someone says "QA this", "test this in browser", "verify the feature", "qa test", "browser test", or after completing an /implement-change to verify acceptance criteria in a real browser. Opens Chrome via MCP, exercises each acceptance criterion, takes screenshots as evidence, and reports pass/fail. The "closer" for every implementation — proof it works, not just that tests pass.
---

# QA Test

Verify implemented features in a real browser. Exercise each acceptance criterion, capture evidence, report results.

## Process

1. Pre-flight (sub-agent) — gather criteria, resolve URL, check environment
2. Open browser and test each criterion
3. Capture evidence (screenshots, console errors, network failures)
4. Report results
5. Handle failures (agent mode: fix and re-test; human mode: discuss)

### 1. Pre-flight Sub-agent

Launch an `Explore` sub-agent **before** any browser interaction to gather all context in parallel. This eliminates serial setup and gives you a complete test plan before opening the browser.

**Sub-agent prompt:**

```
Gather QA pre-flight context for testing. Return a structured JSON block with:

1. **acceptance_criteria**: List of testable criteria. Check these sources in order,
   stop at the first that has criteria:
   - The user's prompt (if criteria were given explicitly)
   - Current PR description: run `gh pr view --json body` via Bash
   - Current branch diff: run `git diff main...HEAD --stat` then read changed files
     to infer what user-visible behavior changed
   - Linked issue: check PR body for issue references, fetch with `gh issue view`

2. **test_url**: Where to test. Check in order:
   - `.tap/tap-audit.md` Environments section
   - `package.json` scripts for `dev`, `start`, or similar
   - Common defaults: localhost:3000, :5173, :4321, :6886

3. **app_running**: Try to fetch the test_url via `curl -s -o /dev/null -w '%{http_code}'`.
   Return the status code. If not running, return the dev command that would start it.

4. **test_pages**: List of specific page URLs/routes to visit based on the changed files
   (e.g., if `modules/campaigns/` changed, the test page is likely `/campaigns/...`)

5. **db_available**: Check if postgres MCP tools are available (search for
   `mcp__postgres__execute_sql` or similar). Return true/false.

6. **has_async_flows**: Based on the changed files, flag whether the feature involves
   background jobs (Temporal workflows, queues, webhooks) that need async verification.

Return results as a structured summary, not raw tool output.
```

**Using the pre-flight results:**

- If `app_running` is not 200, start the dev server (background) and wait for it
- Use `acceptance_criteria` to build the test plan — skip "Gather Acceptance Criteria" entirely
- Use `test_pages` to know where to navigate first
- If `db_available`, include database verification steps
- If `has_async_flows`, use the async testing pattern (poll snapshots, check DB for final state)

**Fallback (no sub-agent):** If sub-agents are unavailable, fall back to gathering criteria and resolving the URL sequentially as described below.

<details>
<summary>Manual fallback: Gather criteria and resolve URL</summary>

**Gather acceptance criteria** from (in priority order):
- Explicit criteria provided in the prompt
- Current ticket/issue (if referenced)
- PR description
- `.tap/tap-audit.md` for environment context

If no criteria found, ask in human mode. In agent mode, infer from the diff: read changed files, identify what user-visible behavior changed, and test that.

**Resolve test URL** (in priority order):
1. URL provided in the prompt
2. `.tap/tap-audit.md` → Environments section
3. `package.json` scripts → `dev`, `start`, or similar
4. Common defaults: `http://localhost:3000`, `http://localhost:5173`, `http://localhost:4321`

Verify the app is running before proceeding:
- Try navigating to the URL
- If not running and a dev command is discoverable, start it
- If can't start, report and stop

</details>

### 2. Browser Testing

Use Chrome MCP tools (`mcp__chrome-devtools__*` or `mcp__claude-in-chrome__*`) to test each criterion.

**Snapshot-first workflow** — use `take_snapshot` as the primary tool for finding and verifying elements. Use `take_screenshot` only for visual evidence capture.

**For each acceptance criterion:**

1. Navigate to the relevant page
2. `take_snapshot` to get element UIDs and current DOM state
3. Interact via UIDs (`click`, `fill`, `hover`)
4. `take_snapshot` again to verify DOM state changed (element appeared, text updated, etc.)
5. `take_screenshot` and save to file as visual evidence
6. Check for console errors (`list_console_messages`) and failed network requests (`list_network_requests`)

**Important**: Element UIDs are ephemeral — they change between snapshots. Always take a fresh snapshot immediately before interacting with elements. Never reuse UIDs from a previous snapshot.

**React/SPA hover interactions:**

Chrome DevTools `hover` only triggers CSS `:hover` pseudo-class, NOT JavaScript `mouseenter`/`mouseover` events. If a UI element (e.g., a toolbar, popover trigger) only appears via React's `onMouseEnter` state:

1. First try `click` directly in the area where the element should appear
2. If that fails, use `evaluate_script` to dispatch a real mouse event:
   ```js
   (el) => {
     // Walk up to find the element with onMouseEnter handler
     let node = el;
     while (node) {
       const fiberKey = Object.keys(node).find(k => k.startsWith('__reactFiber'));
       if (fiberKey && node[fiberKey]?.memoizedProps?.onMouseEnter) {
         node.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
         return 'dispatched';
       }
       node = node.parentElement;
     }
     return 'no handler found';
   }
   ```
3. Then `take_snapshot` to confirm the hover-dependent elements are now in the a11y tree

**Testing patterns:**
- **Form submission**: Fill fields → submit → verify success state + check no errors
- **Navigation flow**: Click link/button → verify new page/state → check URL
- **State changes**: Trigger action → verify UI updated → verify persistence (reload)
- **Async operations**: Trigger action → verify intermediate state (loading/pending) → wait or poll with snapshots → verify final state. For background jobs, check database via postgres MCP or poll the UI.
- **Error states**: Trigger invalid input → verify error messaging
- **Responsive**: Resize viewport (`resize_page`) → verify layout adapts

**What to always check (beyond explicit criteria):**
- Console errors (JS exceptions, failed assertions)
- Failed network requests (4xx, 5xx)
- Visual regressions (layout broken, text overflow, missing images)
- Broken links or dead-end flows

### 3. Evidence Capture

For each criterion tested:
- Screenshot of the result state
- Any console errors observed
- Any failed network requests
- Pass or fail determination with reason

Save screenshots to a descriptive path (e.g., `./qa-evidence/criterion-1-login-form.png`).

### 4. Report Results

Use the template in [references/qa-report-template.md](references/qa-report-template.md) for the structured report.

**Human mode**: Present results interactively. Walk through each criterion, show screenshots, explain failures, ask if anything else needs testing.

**Agent mode**: Write report to `./qa-evidence/qa-report.md`. If all pass, proceed (e.g., open PR). If any fail, attempt to fix and re-test (max 2 retry cycles). If still failing after retries, open PR with failures documented.

### 5. Failure Handling

**Agent mode — fix and re-test loop:**
1. Identify the root cause from the failure evidence
2. Fix the code (use existing implement-change patterns)
3. Re-run ONLY the failed criteria
4. Max 2 fix-and-retest cycles. If still failing, stop and report.

**Human mode:**
- Present failures with evidence
- Ask: "Want me to fix this and re-test, or is this expected behavior?"

### Optional: Database Verification

For features that create or modify data, browser testing alone may not catch data-layer bugs. Use postgres MCP (or similar) to spot-check:

- **Record creation**: Verify the expected rows exist with correct values (FKs, status fields, timestamps)
- **Relational data**: Confirm junction table rows were created (e.g., copied products, assets, tags)
- **Status transitions**: Confirm async workflows completed (e.g., `ai_draft` → `draft`)

This is especially valuable when the UI shows only a summary of what was persisted, or when a background job processes the data after the initial API response.

## Boundaries

- Does NOT write unit tests (that's implement-acceptance-tests)
- Does NOT review code quality (that's CLAUDE.md / code review)
- Does NOT assess blast radius (that's /blast-radius)
- Tests user-visible behavior in the browser, with optional database verification for data mutations
- Does NOT modify acceptance criteria — tests what was specified
