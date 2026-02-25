---
name: qa-test
description: Browser-based QA verification after any implementation. Use when someone says "QA this", "test this in browser", "verify the feature", "qa test", "browser test", or after completing an /implement-change to verify acceptance criteria in a real browser. Opens Chrome via MCP, exercises each acceptance criterion, takes screenshots as evidence, and reports pass/fail. The "closer" for every implementation — proof it works, not just that tests pass.
---

# QA Test

Verify implemented features in a real browser. Exercise each acceptance criterion, capture evidence, report results.

## Process

1. Gather acceptance criteria
2. Resolve test URL
3. Open browser and test each criterion
4. Capture evidence (screenshots, console errors, network failures)
5. Report results
6. Handle failures (agent mode: fix and re-test; human mode: discuss)

### 1. Gather Acceptance Criteria

Find acceptance criteria from (in priority order):
- Explicit criteria provided in the prompt
- Current ticket/issue (if referenced)
- PR description
- `.tap/tap-audit.md` for environment context

If no criteria found, ask in human mode. In agent mode, infer from the diff: read changed files, identify what user-visible behavior changed, and test that.

### 2. Resolve Test URL

Determine where to test (in priority order):
1. URL provided in the prompt
2. `.tap/tap-audit.md` → Environments section
3. `package.json` scripts → `dev`, `start`, or similar
4. Common defaults: `http://localhost:3000`, `http://localhost:5173`, `http://localhost:4321`

Verify the app is running before proceeding:
- Try navigating to the URL
- If not running and a dev command is discoverable, start it
- If can't start, report and stop

### 3. Browser Testing

Use Chrome MCP tools (`mcp__chrome-devtools__*` or `mcp__claude-in-chrome__*`) to test each criterion.

**For each acceptance criterion:**

1. Navigate to the relevant page
2. Perform the interaction (click, fill, submit, navigate)
3. Verify the expected outcome (element visible, state changed, content correct)
4. Check for console errors (`list_console_messages`)
5. Check for failed network requests (`list_network_requests`)
6. Take a screenshot (`take_screenshot`) as evidence

**Testing patterns:**
- **Form submission**: Fill fields → submit → verify success state + check no errors
- **Navigation flow**: Click link/button → verify new page/state → check URL
- **State changes**: Trigger action → verify UI updated → verify persistence (reload)
- **Error states**: Trigger invalid input → verify error messaging
- **Responsive**: Resize viewport (`resize_page`) → verify layout adapts
- **Loading states**: Check behavior during network requests

**What to always check (beyond explicit criteria):**
- Console errors (JS exceptions, failed assertions)
- Failed network requests (4xx, 5xx)
- Visual regressions (layout broken, text overflow, missing images)
- Broken links or dead-end flows

### 4. Evidence Capture

For each criterion tested:
- Screenshot of the result state
- Any console errors observed
- Any failed network requests
- Pass or fail determination with reason

Save screenshots to a descriptive path (e.g., `./qa-evidence/criterion-1-login-form.png`).

### 5. Report Results

Use the template in [references/qa-report-template.md](references/qa-report-template.md) for the structured report.

**Human mode**: Present results interactively. Walk through each criterion, show screenshots, explain failures, ask if anything else needs testing.

**Agent mode**: Write report to `./qa-evidence/qa-report.md`. If all pass, proceed (e.g., open PR). If any fail, attempt to fix and re-test (max 2 retry cycles). If still failing after retries, open PR with failures documented.

### 6. Failure Handling

**Agent mode — fix and re-test loop:**
1. Identify the root cause from the failure evidence
2. Fix the code (use existing implement-change patterns)
3. Re-run ONLY the failed criteria
4. Max 2 fix-and-retest cycles. If still failing, stop and report.

**Human mode:**
- Present failures with evidence
- Ask: "Want me to fix this and re-test, or is this expected behavior?"

## Boundaries

- Does NOT write unit tests (that's implement-acceptance-tests)
- Does NOT review code quality (that's CLAUDE.md / code review)
- Does NOT assess blast radius (that's /blast-radius)
- ONLY tests user-visible behavior in the browser
- Does NOT modify acceptance criteria — tests what was specified
