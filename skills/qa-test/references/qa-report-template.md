# QA Report Template

Use this template for qa-test results. Adapt based on what was tested — omit sections where not applicable.

```markdown
# QA Test Report
Date: [YYYY-MM-DD]
Feature: [what was tested]
URL: [where it was tested]
Result: [PASS / FAIL / PARTIAL]

## Criteria Results

### 1. [criterion description]
- Status: PASS / FAIL
- Observed: [what the snapshot showed]
- Notes: [any relevant detail]

### 2. [criterion description]
- Status: PASS / FAIL
- Observed: [what the snapshot showed]
- Notes: [any relevant detail]

[repeat for each criterion]

## Console Errors
- [error message] on [page/action]
[or "None observed"]

## Failed Network Requests
- [method] [url] → [status code] on [action]
[or "None observed"]

## Summary
[1-2 sentences: what works, what doesn't, blocking issues]

## Failure Evidence (if any)
- [screenshot path] — [what it shows]
[Screenshots captured only for failed criteria]

## Fix Attempts (if any)
### Attempt 1
- Issue: [what failed]
- Fix: [what was changed]
- Result: [PASS / FAIL]
```
