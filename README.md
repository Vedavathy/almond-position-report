# Almond Position Report

Monthly market analysis tool built on data from the Almond Board of California. Tracks shipments, receipts, commitments, and inventory for the California almond industry across the crop year (August-July).

## What it does

- **Automated report generation**: A GitHub Actions pipeline fetches the ABC position report PDF, extracts data, calculates derived metrics (FTM, YTD, Sales), generates a narrative with Claude AI, and appends market insights with citations.
- **Archive**: Browse all monthly reports at `/archive`, each with a summary data table and full narrative.
- **Homepage dashboard**: Bento grid layout with latest report stats, YOY changes, and the shipment flash table.

## Tech stack

| Layer              | Tool                                    |
| :----------------- | :-------------------------------------- |
| Framework          | Astro (MDX content collection)          |
| Styling            | Tailwind CSS v4                         |
| Hosting            | Vercel                                  |
| Pipeline runtime   | GitHub Actions (scheduled + on-demand)  |
| AI narrative       | Claude API via Vercel AI SDK            |
| PDF extraction     | Claude API (fallback from pdfjs-dist)   |
| GitHub writes      | Octokit                                 |
| Data store         | JSON in repo (`historical-data.json`)   |

## Project structure

```
app/
  src/
    content/reports/     # MDX report files (may-2026.mdx, etc.)
    data/                # historical-data.json
    components/          # Astro components (Header, DataTable, etc.)
    layouts/             # BaseLayout
    pages/               # /, /archive, /archive/[slug]
  scripts/
    generate-report.ts   # Generation pipeline
.github/
  workflows/
    generate-report.yml  # Scheduled + manual trigger
```

## Local development

```sh
cd app
npm install
npm run dev
```

The dev server runs at `localhost:4321`.

To run the generation pipeline locally:

```sh
cd app
npx tsx scripts/generate-report.ts May 2026
```

Requires `ANTHROPIC_API_KEY` set in environment.

## Report generation pipeline

The pipeline runs as a GitHub Actions workflow on a schedule (`cron: 5 17 10-20 * *`, i.e. 9:05 AM PST daily from the 10th-20th of each month) or via manual dispatch.

1. **Data check** -- if data exists in the historical store, skip PDF extraction
2. **PDF fetch + extract** -- download ABC PDF and extract metrics with Claude API
3. **FTM calculation** -- compute for-the-month values from YTD deltas
4. **Narrative generation** -- Claude generates Market Update, Receipts, Shipments, Sales & Commitments, In a Nutshell sections
5. **Market insights** -- Claude generates 3-6 external insights with directional impact and citations (US-04 spec)
6. **MDX build** -- assemble frontmatter + narrative + insights into report file
7. **Commit + deploy** -- push to repo, Vercel auto-redeploys

## Environment variables

| Variable            | Where          | Purpose                          |
| :------------------ | :------------- | :------------------------------- |
| `ANTHROPIC_API_KEY` | GitHub Secrets | Claude API access for generation |
| `GITHUB_TOKEN`      | GitHub Actions | Auto-provided for workflow       |
| `GITHUB_OWNER`      | Vercel env     | Repo owner for API trigger       |
| `GITHUB_REPO`       | Vercel env     | Repo name for API trigger        |
