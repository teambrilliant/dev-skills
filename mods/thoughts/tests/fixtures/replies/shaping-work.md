```
`★ Shaped View ───────────────────────────────────`
Saved-search results stuck in-app → one-click CSV download of a saved search's current results
  ├─ Export from the results view + saved-searches list; file = visible columns, live results at click time
  ├─ Row cap with an up-front warning; only rows the user can currently see
  └─ Open: cap value, plan-tier gating; assumes "export results", not "export search definitions"
`───────────────────────────────────────────── ★`
```

**Assumption:** "export saved searches" means exporting the **results** of a saved search. Users want that data in a spreadsheet. A CSV of the search definitions themselves (name, filters) isn't useful to anyone. If definitions were meant, this becomes a different, smaller shape.

## Export saved search results as CSV

Let users download the current results of any saved search as a CSV file, so they can work with the data in Excel or Google Sheets, share it, or feed it into other tools without copying by hand.

**Stakes:** customer-facing

### Strategic Fit

No durable product context in repo. If no bet covers this, it's table stakes: "can I get my data out?" is a common reason people churn or contact support.

### Acceptance Criteria

**Entry points**
- An "Export CSV" action appears on the saved search results view.
- An "Export CSV" action appears on each row of the saved searches list.
- Both produce the same file for the same saved search.

**File contents**
- The file contains the search's results at the moment of the click, not the results from when the search was saved.
- Columns match the columns visible in the results view, in the same order, with the same header labels.
- The first row is the header row. Every following row is one result.
- Values containing commas, double quotes, or line breaks still land in a single cell when opened in Excel or Google Sheets.
- Accented and non-Latin characters (e.g. `é`, `ü`, `日本`) display correctly when the file is double-clicked open in Excel.
- A cell value starting with `=`, `+`, `-`, or `@` shows as literal text in Excel or Sheets and is never run as a formula.
- Dates and numbers are exported as plain values, not localized display strings (e.g. `2026-10-07`, not "Oct 7").

**File name**
- File name is `<saved search name>-<YYYY-MM-DD>.csv`. Characters that aren't valid in file names are replaced with `-`.

**Size limits**
- If results are at or under the row cap, the download starts right away.
- If results exceed the cap, the user sees a message before downloading: "This search has X results. Exports include the first N. Narrow your search to export everything." They can continue or cancel.
- A search with zero results downloads a file with only the header row. The export never errors out.

**Permissions**
- The export includes only rows the user can see right now in the results view. Shared saved searches follow the viewer's permissions, not the owner's.
- A user can't export a saved search they don't have access to. Requesting it directly returns the same "not found" they'd get when opening it.

### Designs

N/A. Use the existing secondary-action and confirmation-dialog patterns.

### Rollout & Rollback

**Flag at the Export CSV action (risk flag).** No shared contract changes, and nothing in the launch needs cohort control. But this is a new bulk-read path on search infrastructure and a new way to get data out of the product. If it causes load spikes or a data-exposure problem, it needs to be turned off in seconds, not after a revert and redeploy. One flag, removed once it's stable.

### Dev Harness

- **Riskiest logic:** turning result rows into CSV bytes (escaping, encoding, formula neutralization, column order). This must be testable as a function fed with fixtures: rows plus a column list in, CSV out, compared against known-good files. No browser needed.
- **Fixtures:** a set of messy real-world values: commas, quotes, embedded newlines, emoji, accented text, leading `=`/`+`/`-`/`@`, empty and null cells, very long strings.
- **Secondary entry point:** the export can be triggered directly for a saved search, without clicking through the UI.
- **Seeded data:** one account with a saved search above the row cap, one with zero results, and one shared search where the viewer's permissions differ from the owner's.
- **External dependencies:** none.

### Risks & Unknowns

- **Abuse: bulk data exfiltration.** A compromised or departing user exports everything they can see, repeatedly.
  Recommend: row cap per export, plus a per-user export rate limit. Log every export (who, which search, row count) so it can be audited.
  Discarded: no limits (a single click becomes a full data dump with no record); requiring admin approval per export (kills the feature for legitimate users).
- **Abuse: CSV formula injection.** An attacker plants `=HYPERLINK(...)` or `=cmd|...` in a field. It runs when a victim opens the export.
  Recommend: neutralize any cell whose value starts with `=`, `+`, `-`, or `@` by prefixing it so it's read as text (covered in the acceptance criteria).
  Discarded: stripping those characters (corrupts legitimate values like negative numbers or `@handles`).
- **Abuse: permission bypass through shared or stale searches.** A search was shared while the viewer had broader access.
  Recommend: always run the export under the viewer's current permissions at click time.
  Discarded: using the owner's permissions (leaks data to anyone a search is shared with).
- **Failure: large export is slow or times out.** The user sees a spinner, then a broken or partial file.
  Recommend: keep exports synchronous under the cap, and set the cap so the worst case finishes well within request limits. If generation fails, show an error and deliver no file. Never deliver a truncated file that looks complete.
  Discarded: async export emailed as a link for v1 (adds a job queue, email, link expiry, and link auth; worth it only if users hit the cap often).
- **Row cap value?**
  Recommend: start at 10,000 rows, then measure how often the cap is hit through the export log and raise it or add async export based on real data.
  Discarded: unlimited (load and exfiltration risk); 1,000 (too low for spreadsheet work, so most real users hit it).
- **Which columns?**
  Recommend: the columns visible in the results view. What you see is what you get, and no internal fields leak.
  Discarded: all fields (exposes internal IDs and system fields, and makes files wide and unreadable); a column picker in v1 (extra UI before anyone has asked for it).
- **Gate export by plan tier?**
  Recommend: available to everyone in v1. Revisit only if pricing strategy calls for it.
  Discarded: paid-only from day one (gating a basic "get my data out" feature creates resentment without a stated pricing bet behind it).
- **Other formats (XLSX, JSON)?**
  Recommend: CSV only. Excel, Sheets, and every downstream tool open it.
  Discarded: XLSX in v1 (heavier generation and no clear demand yet).

No `.tap/product.md` was available, so `/tap-skills:curate-product-context` would let future shapes state strategic fit against real bets. Next step: `/dev-skills:write-plan`. Nothing was written to disk, as you asked.
