## Data Fetching Reliability Notes

### almonds.org Position Report listing page can return stale results

**Incident (2026-07-09):** Fetching `https://www.almonds.org/tools-and-resources/crop-reports/position-reports` returned a listing that stopped at "May 2026" (with "Download Latest" pointing to the May report), even though the June 2026 report was already live at that exact time — confirmed by directly fetching `https://www.almonds.org/sites/default/files/2026-07/2026.06_PosRpt_9402.pdf` and by the user browsing the same listing page directly and seeing June listed. This caused a false "report not yet published" conclusion during a scheduled run, and the monthly email was skipped incorrectly.

Root cause: the listing page's `meta-last_updated` field is a static-page-template timestamp — it does **not** reflect the freshness of the dynamically-rendered report list embedded in the page. It was (wrongly) treated as a freshness signal.

**Protocol going forward — before concluding a monthly report "hasn't been published yet":**
1. Never rely on `meta-last_updated` as an availability signal for the report list.
2. Re-fetch the listing page at least once more before concluding non-availability (a single fetch is not sufficient evidence, especially on or after the scheduled release date from the Position Report Release Schedule — see `image.png` / `summary.md`).
3. Cross-check with WebSearch using the specific expected title/filename, e.g. `"<Month> <Year> Almond Industry Position Report" site:almonds.org` or `"<YYYY>.<MM>_PosRpt"`.
4. If still not found after both checks, report it as "not visible via automated fetch — possible caching lag; verify directly on almonds.org" rather than flatly asserting the report doesn't exist yet.
5. If a report is genuinely not out yet (checked and confirmed), do not fabricate data or send the monthly email — that part of the original process is still correct.

PDF URLs follow the pattern `https://www.almonds.org/sites/default/files/{YYYY}-{next-month, zero-padded}/{YYYY}.{MM}_PosRpt_{random 4-digit}.pdf`. The 4-digit suffix is random/non-sequential and cannot be guessed — it must be discovered via the listing page or a search result.
