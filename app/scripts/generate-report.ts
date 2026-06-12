import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_ABBREVS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const CROP_YEAR_MONTHS = ['aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul'];

const ABC_POSITION_REPORT_URL = 'https://www.almonds.org/tools-and-resources/crop-reports/position-reports';

// ─── Step 1: Parse CLI args ─────────────────────────────────────────────────

const monthArg = process.argv[2];
const yearArg = process.argv[3];

if (!monthArg || !yearArg) {
  console.error('Usage: tsx scripts/generate-report.ts <month> <year>');
  console.error('  e.g. tsx scripts/generate-report.ts June 2026');
  process.exit(1);
}

const monthIndex = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthArg.toLowerCase());
if (monthIndex === -1) {
  console.error(`Invalid month: ${monthArg}. Use full month name (e.g. January).`);
  process.exit(1);
}

const month = MONTH_NAMES[monthIndex];
const monthAbbrev = MONTH_ABBREVS[monthIndex];
const year = parseInt(yearArg, 10);
const dataMonthKey = `${monthAbbrev}-${year}`;

const cropYearStart = monthIndex >= 7 ? year : year - 1; // Aug-Dec = same year, Jan-Jul = prior year
const cropYear = `${cropYearStart}-${cropYearStart + 1}`;
const currentCropKey = `${cropYearStart + 1}-crop`; // e.g. "2025-crop" for 2025-2026 crop year
const priorCropKey = `${cropYearStart}-crop`;

console.log(`\n=== Generating ${month} ${year} Position Report ===`);
console.log(`Crop Year: ${cropYear} | Data key: ${dataMonthKey}`);
console.log(`Current crop: ${currentCropKey} | Prior crop: ${priorCropKey}\n`);

// ─── Step 2: Fetch and parse the ABC PDF ────────────────────────────────────

async function fetchAbcPdf(): Promise<Buffer> {
  console.log('Step 2: Fetching ABC position report PDF...');

  const searchUrl = `https://www.almonds.org/sites/default/files/2026-${String(monthIndex + 1).padStart(2, '0')}/${year}-${String(monthIndex + 1).padStart(2, '0')}-position-report.pdf`;
  const altUrl = `https://www.almonds.org/sites/default/files/${year}-${String(monthIndex + 1).padStart(2, '0')}/position-report.pdf`;

  for (const url of [searchUrl, altUrl]) {
    try {
      console.log(`  Trying: ${url}`);
      const response = await fetch(url);
      if (response.ok) {
        console.log(`  Found PDF at ${url}`);
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer);
      }
    } catch {
      // try next URL
    }
  }

  console.log('  Could not find PDF at known URLs, will use Claude API to extract from page...');
  return Buffer.alloc(0);
}

async function extractDataWithClaude(pdfBuffer: Buffer, historicalData: any): Promise<{
  currentCrop: Record<string, number | null>;
  priorCrop: Record<string, number | null>;
}> {
  console.log('Step 2b: Extracting data using Claude API...');

  const priorMonthIndex = CROP_YEAR_MONTHS.indexOf(monthAbbrev) - 1;
  let priorMonthKey: string | null = null;
  if (priorMonthIndex >= 0) {
    const priorAbbrev = CROP_YEAR_MONTHS[priorMonthIndex];
    const priorYear = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul'].includes(priorAbbrev)
      ? cropYearStart + 1
      : cropYearStart;
    priorMonthKey = `${priorAbbrev}-${priorYear}`;
  }

  const priorMonthCurrentCrop = priorMonthKey
    ? historicalData.cropYears[currentCropKey]?.months?.[priorMonthKey]
    : null;
  const priorMonthPriorCrop = priorMonthKey
    ? historicalData.cropYears[priorCropKey]?.months?.[priorMonthKey]
    : null;

  let prompt: string;

  if (pdfBuffer.length > 0) {
    const base64Pdf = pdfBuffer.toString('base64');
    prompt = `You are analyzing an Almond Board of California position report PDF for ${month} ${year}.

Extract the following 6 raw values for BOTH the current crop year (${cropYear}, labeled as "${cropYearStart + 1} Crop" or "${cropYear}") and the prior crop year (${cropYearStart - 1}-${cropYearStart}, labeled as "${cropYearStart} Crop" or "${cropYearStart - 1}-${cropYearStart}"):

1. **Crop Receipts to date** (YTD Receipts) — labeled "Crop Receipts" in the report
2. **Total Shipments to date** (YTD Shipments) — labeled "Total Shipments"
3. **Domestic Shipments to date** — for context
4. **Export Shipments to date** — for context
5. **Total Committed Shipments** (Commitments)
6. **Uncommitted Inventory**

Return ONLY a JSON object with this exact structure (values in lbs as integers, no commas):
{
  "currentCrop": {
    "ytdReceipts": <number>,
    "ytdShipments": <number>,
    "domesticShipments": <number>,
    "exportShipments": <number>,
    "commitments": <number>,
    "uncommittedInventory": <number>
  },
  "priorCrop": {
    "ytdReceipts": <number>,
    "ytdShipments": <number>,
    "domesticShipments": <number>,
    "exportShipments": <number>,
    "commitments": <number>,
    "uncommittedInventory": <number>
  }
}

The PDF content is provided as a base64-encoded document.`;

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'file', data: base64Pdf, mimeType: 'application/pdf' },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Claude did not return valid JSON');
    const extracted = JSON.parse(jsonMatch[0]);

    return calculateDerivedFields(extracted, priorMonthCurrentCrop, priorMonthPriorCrop);
  } else {
    // No PDF available — prompt Claude to search for the data
    prompt = `I need the Almond Board of California position report data for ${month} ${year}.
The ABC publishes these reports at: ${ABC_POSITION_REPORT_URL}

I need the following metrics for BOTH the current crop year (${cropYear}) and prior crop year (${cropYearStart - 1}-${cropYearStart}):
1. Crop Receipts to date (YTD)
2. Total Shipments to date (YTD)
3. Total Committed Shipments (Commitments)
4. Uncommitted Inventory

If you have this data from your training, return it as JSON. If not, return {"error": "PDF not available"}.

Return ONLY JSON:
{
  "currentCrop": { "ytdReceipts": <number>, "ytdShipments": <number>, "commitments": <number>, "uncommittedInventory": <number> },
  "priorCrop": { "ytdReceipts": <number>, "ytdShipments": <number>, "commitments": <number>, "uncommittedInventory": <number> }
}`;

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      prompt,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Claude did not return valid JSON');
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.error) throw new Error(parsed.error);

    return calculateDerivedFields(parsed, priorMonthCurrentCrop, priorMonthPriorCrop);
  }
}

function calculateDerivedFields(
  extracted: any,
  priorMonthCurrentCrop: any,
  priorMonthPriorCrop: any,
): { currentCrop: Record<string, number | null>; priorCrop: Record<string, number | null> } {
  const calcFtm = (ytd: number, priorYtd: number | null) =>
    priorYtd !== null ? ytd - priorYtd : ytd;

  const calcSales = (commitments: number, ftmShipments: number, priorCommitments: number | null) =>
    priorCommitments !== null ? commitments - ftmShipments - priorCommitments : null;

  // Current crop
  const currentFtmReceipts = calcFtm(extracted.currentCrop.ytdReceipts, priorMonthCurrentCrop?.ytdReceipts ?? null);
  const currentFtmShipments = calcFtm(extracted.currentCrop.ytdShipments, priorMonthCurrentCrop?.ytdShipments ?? null);
  const currentSales = calcSales(extracted.currentCrop.commitments, currentFtmShipments, priorMonthCurrentCrop?.commitments ?? null);

  // Prior crop
  const priorFtmReceipts = calcFtm(extracted.priorCrop.ytdReceipts, priorMonthPriorCrop?.ytdReceipts ?? null);
  const priorFtmShipments = calcFtm(extracted.priorCrop.ytdShipments, priorMonthPriorCrop?.ytdShipments ?? null);
  const priorSales = calcSales(extracted.priorCrop.commitments, priorFtmShipments, priorMonthPriorCrop?.commitments ?? null);

  return {
    currentCrop: {
      ytdReceipts: extracted.currentCrop.ytdReceipts,
      ftmReceipts: currentFtmReceipts,
      ytdShipments: extracted.currentCrop.ytdShipments,
      ftmShipments: currentFtmShipments,
      commitments: extracted.currentCrop.commitments,
      uncommittedInventory: extracted.currentCrop.uncommittedInventory,
      sales: currentSales,
    },
    priorCrop: {
      ytdReceipts: extracted.priorCrop.ytdReceipts,
      ftmReceipts: priorFtmReceipts,
      ytdShipments: extracted.priorCrop.ytdShipments,
      ftmShipments: priorFtmShipments,
      commitments: extracted.priorCrop.commitments,
      uncommittedInventory: extracted.priorCrop.uncommittedInventory,
      sales: priorSales,
    },
  };
}

// ─── Step 3: Update Historical Data store ───────────────────────────────────

function updateHistoricalData(
  historicalData: any,
  currentCropData: Record<string, number | null>,
  priorCropData: Record<string, number | null>,
): any {
  console.log('Step 3: Updating historical data store...');

  if (!historicalData.cropYears[currentCropKey]) {
    historicalData.cropYears[currentCropKey] = {
      label: `${cropYear} Crop Year (${cropYearStart + 1} Crop)`,
      months: {},
    };
  }
  if (!historicalData.cropYears[priorCropKey]) {
    historicalData.cropYears[priorCropKey] = {
      label: `${cropYearStart - 1}-${cropYearStart} Crop Year (${cropYearStart} Crop)`,
      months: {},
    };
  }

  historicalData.cropYears[currentCropKey].months[dataMonthKey] = {
    month,
    year,
    ...currentCropData,
  };

  historicalData.cropYears[priorCropKey].months[dataMonthKey] = {
    month,
    year,
    ...priorCropData,
  };

  return historicalData;
}

// ─── Step 4: Generate narrative with Claude ─────────────────────────────────

function formatLbs(value: number | null): string {
  if (value === null) return 'N/A';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(3)} billion lbs.`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} million lbs.`;
  return `${value.toLocaleString()} lbs.`;
}

function calcYoy(current: number | null, prior: number | null): string {
  if (current === null || prior === null || prior === 0) return 'N/A';
  const pct = ((current - prior) / prior) * 100;
  const dir = pct > 0 ? 'up' : 'down';
  return `${dir} ${Math.abs(pct).toFixed(1)}%`;
}

async function generateNarrative(
  currentCropData: Record<string, number | null>,
  priorCropData: Record<string, number | null>,
): Promise<string> {
  console.log('Step 4: Generating report narrative with Claude...');

  const dataContext = `
## ${month} ${year} Position Report Data

### Current Crop Year (${cropYear} — ${cropYearStart + 1} Crop)
- FTM Receipts: ${formatLbs(currentCropData.ftmReceipts as number)}
- YTD Receipts: ${formatLbs(currentCropData.ytdReceipts as number)}
- FTM Shipments: ${formatLbs(currentCropData.ftmShipments as number)}
- YTD Shipments: ${formatLbs(currentCropData.ytdShipments as number)}
- Sales: ${formatLbs(currentCropData.sales as number)}
- Commitments: ${formatLbs(currentCropData.commitments as number)}
- Uncommitted Inventory: ${formatLbs(currentCropData.uncommittedInventory as number)}

### Prior Crop Year (${cropYearStart - 1}-${cropYearStart} — ${cropYearStart} Crop)
- FTM Receipts: ${formatLbs(priorCropData.ftmReceipts as number)}
- YTD Receipts: ${formatLbs(priorCropData.ytdReceipts as number)}
- FTM Shipments: ${formatLbs(priorCropData.ftmShipments as number)}
- YTD Shipments: ${formatLbs(priorCropData.ytdShipments as number)}
- Sales: ${formatLbs(priorCropData.sales as number)}
- Commitments: ${formatLbs(priorCropData.commitments as number)}
- Uncommitted Inventory: ${formatLbs(priorCropData.uncommittedInventory as number)}

### Year-over-Year Changes
- FTM Receipts: ${calcYoy(currentCropData.ftmReceipts as number, priorCropData.ftmReceipts as number)}
- YTD Receipts: ${calcYoy(currentCropData.ytdReceipts as number, priorCropData.ytdReceipts as number)}
- FTM Shipments: ${calcYoy(currentCropData.ftmShipments as number, priorCropData.ftmShipments as number)}
- YTD Shipments: ${calcYoy(currentCropData.ytdShipments as number, priorCropData.ytdShipments as number)}
- Sales: ${calcYoy(currentCropData.sales as number, priorCropData.sales as number)}
- Commitments: ${calcYoy(currentCropData.commitments as number, priorCropData.commitments as number)}
- Uncommitted Inventory: ${calcYoy(currentCropData.uncommittedInventory as number, priorCropData.uncommittedInventory as number)}
`;

  const systemPrompt = `You are writing the narrative section of a monthly almond position report. Follow these rules strictly:

VOICE & STYLE:
- Speak like a trusted global food expert who partners with customers and farmers
- No emojis anywhere
- No bullet points in narrative body — prose only
- 3–5 sentence paragraphs, medium-length sentences
- Minimal jargon and buzzwords
- Max 1 em dash per 1,000 words
- All monetary and volume figures in millions or billions of pounds (e.g., '219.9 million lbs.')
- YOY comparisons always include both the absolute direction and the percentage (e.g., 'down 8.8% vs. last April')
- Be authoritative but not alarmist

STRUCTURE — generate these exact sections as markdown headings:
## Market Update
(1 paragraph: when the report was released, which report number for the crop year)

## Receipts
(1–2 paragraphs analyzing FTM and YTD receipts with YOY comparisons)

## Shipments
(2–3 paragraphs: total shipments overview, then domestic, then export with regional color if possible)

## Sales and Commitments
(2 paragraphs: sales analysis, then commitments and uncommitted inventory)

## In a Nutshell
(2–3 paragraphs: executive summary tying together the key themes, forward outlook)

Do NOT include a data table — it is rendered separately. Do NOT include front-matter. Start directly with ## Market Update.`;

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: systemPrompt,
    prompt: `Write the narrative for the ${month} ${year} Almond Position Report using this data:\n${dataContext}`,
    maxTokens: 4000,
  });

  return text;
}

// ─── Step 5: Build MDX file ─────────────────────────────────────────────────

function buildMdx(narrative: string, releaseDate: string): string {
  const frontmatter = `---
title: "${month} ${year} Almond Position Report"
month: "${month}"
year: ${year}
cropYear: "${cropYear}"
releaseDate: "${releaseDate}"
generatedAt: "${new Date().toISOString().split('T')[0]}"
dataMonth: "${dataMonthKey}"
---`;

  return `${frontmatter}\n\n${narrative}\n`;
}

// ─── Main pipeline ──────────────────────────────────────────────────────────

async function main() {
  const dataPath = resolve(process.cwd(), 'src/data/historical-data.json');
  const historicalData = JSON.parse(readFileSync(dataPath, 'utf-8'));

  // Check if report already exists
  const reportPath = resolve(process.cwd(), `src/content/reports/${dataMonthKey}.mdx`);
  try {
    readFileSync(reportPath);
    console.log(`WARNING: Report ${dataMonthKey}.mdx already exists. It will be overwritten.`);
  } catch {
    // File doesn't exist, good
  }

  // Step 2: Fetch and extract data
  const pdfBuffer = await fetchAbcPdf();
  const { currentCrop, priorCrop } = await extractDataWithClaude(pdfBuffer, historicalData);

  console.log('\nExtracted data:');
  console.log('  Current crop:', JSON.stringify(currentCrop, null, 2));
  console.log('  Prior crop:', JSON.stringify(priorCrop, null, 2));

  // Step 3: Update historical data
  const updatedData = updateHistoricalData(historicalData, currentCrop, priorCrop);
  writeFileSync(dataPath, JSON.stringify(updatedData, null, 2) + '\n');
  console.log(`  Updated ${dataPath}`);

  // Step 4: Generate narrative
  const narrative = await generateNarrative(currentCrop, priorCrop);
  console.log('  Narrative generated (' + narrative.length + ' chars)');

  // Step 5: Build and write MDX
  const today = new Date().toISOString().split('T')[0];
  const mdx = buildMdx(narrative, today);
  writeFileSync(reportPath, mdx);
  console.log(`  Written to ${reportPath}`);

  console.log(`\n=== Report generation complete for ${month} ${year} ===\n`);
}

main().catch((err) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
