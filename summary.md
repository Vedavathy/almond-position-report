What is Almond Position Report

---

## Web App — Tech Stack & Tool Decisions

The Almond Position Report Web App automates the manual workflow below. See the PRD (`Almond Position Report Web App - PRD.docx`) for full requirements.

**Framework & Hosting**
- Framework: Astro (content-first, MDX for report files, zero JS by default)
- Hosting: Vercel free tier — static site and lightweight trigger endpoint only
- Styling: Tailwind CSS v4 (greyscale palette as defined in CLAUDE1.md)

**Pipeline Runtime — GitHub Actions (not Vercel serverless)**
The full generation pipeline runs as a GitHub Actions workflow, not a Vercel function. Vercel Hobby plan caps serverless functions at 10 seconds — not enough for PDF fetch + parse + AI generation + GitHub writes. GitHub Actions free tier allows up to 6 hours per job. The Vercel `/api/generate` endpoint simply triggers the workflow via the GitHub API.

**PDF Parsing**
- Primary: `pdfjs-dist` — layout-aware extraction suited to the ABC's table-heavy PDFs
- Fallback: Claude API via Vercel AI SDK (`@ai-sdk/anthropic`) — handles reformatted or complex PDFs robustly

**AI / Narrative Generation**
- Claude API (Anthropic) via Vercel AI SDK — generates the report narrative in brand voice (authoritative, no bullets, 3–5 sentence paragraphs, correct YOY phrasing)

**GitHub Writes**
- Octokit (`@octokit/rest`) — commits generated MDX report files and the updated Historical Data JSON to the repo; the push triggers Vercel to redeploy automatically

**Web Enrichment (Phase 3)**
- Tavily API — AI-optimised web search for RPAC, AgWest, INC commentary
- Firecrawl — scrapes specific known commentary pages; both have Node.js SDKs

**Historical Data Store**
- JSON file committed to the repo (replaces Historical Data.xlsx) — version-controlled, no external dependency

**Summary of tool choices:**

| Layer | Tool |
|---|---|
| Framework | Astro |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel (static + trigger) |
| Pipeline runtime | GitHub Actions |
| PDF parsing | pdfjs-dist + Claude API fallback |
| AI narrative | Claude API (@ai-sdk/anthropic) |
| GitHub writes | Octokit (@octokit/rest) |
| Web enrichment | Tavily API + Firecrawl |
| Data store | JSON in repo |

---

Each month, the Almond Board of California publishes a position report, which contains the most recent almond trade statistics. Reference these reports to get the latest shipment information and understand the trends impacting the almond industry. The reports follow the Almond Board’s crop year (August 1 to July 31) which aligns with the almond crop production cycle. August, the beginning of harvest, marks the beginning of each new crop year and the following July position report rounds out the final shipment numbers for each year. 


Instructions

1. If Historical Data file exists follow this: 
 - For latest month download the position report from the website: https://www.almonds.org/tools-and-resources/crop-reports/position-reports?page=0 and store it in the folder inside the current folder named for the month (E.g. For "April Monthly position report" create folder "April 2026")
 - Before concluding the latest month's report isn't published yet, follow the verification protocol in `CLAUDE.md` ("Data Fetching Reliability Notes") — a single fetch of the listing page is not sufficient evidence, since it can return stale results.

 Latest month data is updated according to the schedule here: ![alt text](image.png)
 - Update the Historical Data table to have data for the latest month column based on the details in section - "Historical Data - How to create"

2. If Historical Data file doesn't exist follow this:

- Download reports for the current almond year (Aug - YTD)
- Create Historical Data file based on instructions in the section  - "Historical Data - How to create"

3. Create the .xlsx monthly almond position report for the latest month using - "Monthly Almond Position Report - How to" and create it in a folder inside the current folder named for the month (E.g. For "April Monthly position report" create folder "April 2026")

4. Create a document in the same folder to summarize the findings and insights. A sample summary is available - "Almond Position Report - Notes"
 - Search the web and Almondn reports if there maybe additional insights available and add as a note at the end of the document (With references) 


Historical Data - How to create

- The table should have following rows and it should be mapped to following from the report.

- The header 2025-2026 shows data for 2025 crop and 2024-2025 shows data for 2024 crop. 

- Create 2 tables one for 2024 crop and one for 2025 crop to maintain data for each of these from August onwards. 

1. YTD Receipts = Crop Receipts 
2. FTM Receipts = Crop Receipts to date in month - Crop Receipts to date for previous month 
- E.g. for this row and column of April 2026 = Crop receipts to date in April 2026 - Crop receipts to date in Mar 2026
- Year starts from Aug
3. YTD Shipments=  Total Shipments
4. FTM Shipments = Total shipments in month - Total shipments for previous month
- E.g. for this row and column of April 2026 = Total Shipments in April 2026 - Total Shipments in Mar 2026
- Year starts from Aug
5. Commitments = Total Committed Shipments
6. Uncommitted inventory = Uncommitted Inventory
7. Sales = Commitments for current month - FTM Shipments for this month - Commitments from previous month


Monthly Almond Position Report - How to
Create a summary table that shows - Monthly report that includes the following for both 2025 and 2024 crop. A sample summary table is available in the folder (Sample Summary.png). No need to add text to generate insights.

- FTM Receipts (Row in the excel file Historical Data.xlsx and value available for the month in the column E.g. for April 2026 position report use the value in the April 2026 column for that row)
- YTD Receipts (Row in the excel file Historical Data.xlsx and value available for the month in the column E.g. for April 2026 position report use the value in the April 2026 column for that row)
- FTM Shipments (Row in the excel file Historical Data.xlsx and value available for the month in the column E.g. for April 2026 position report use the value in the April 2026 column for that row)
- YTD Shipments (Row in the excel file Historical Data.xlsx and value available for the month in the column E.g. for April 2026 position report use the value in the April 2026 column for that row)
- Sales (Row in the excel file Historical Data.xlsx and value available for the month in the column E.g. for April 2026 position report use the value in the April 2026 column for that row)
- Commitments (Row in the excel file Historical Data.xlsx and value available for the month in the column E.g. for April 2026 position report use the value in the April 2026 column for that row)
- Uncommitted Inventory (Row in the excel file Historical Data.xlsx and value available for the month in the column E.g. for April 2026 position report use the value in the April 2026 column for that row)

