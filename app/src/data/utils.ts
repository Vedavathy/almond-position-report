import historicalData from './historical-data.json';

export type MonthData = {
  month: string;
  year: number;
  ytdReceipts: number;
  ftmReceipts: number;
  ytdShipments: number;
  ftmShipments: number;
  commitments: number;
  uncommittedInventory: number;
  sales: number | null;
};

export type CropYear = {
  label: string;
  months: Record<string, MonthData>;
};

export function getHistoricalData() {
  return historicalData.cropYears as Record<string, CropYear>;
}

export function getMonthData(cropYearKey: string, monthKey: string): MonthData | null {
  const cropYear = historicalData.cropYears[cropYearKey as keyof typeof historicalData.cropYears];
  if (!cropYear) return null;
  return (cropYear.months as Record<string, MonthData>)[monthKey] ?? null;
}

export function formatLbs(value: number | null): string {
  if (value === null) return 'N/A';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(3)} billion lbs.`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} million lbs.`;
  }
  return `${value.toLocaleString()} lbs.`;
}

export function formatLbsShort(value: number | null): string {
  if (value === null) return 'N/A';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  return value.toLocaleString();
}

export function calcYoyChange(current: number | null, prior: number | null): number | null {
  if (current === null || prior === null || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

export function formatPct(value: number | null): string {
  if (value === null) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function getLatestMonth(): { cropYearKey: string; monthKey: string; data: MonthData } | null {
  const cropYears = getHistoricalData();
  const monthOrder = ['aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul'];

  for (const cropYearKey of Object.keys(cropYears).sort().reverse()) {
    const months = cropYears[cropYearKey].months;
    const sortedKeys = Object.keys(months).sort((a, b) => {
      const aMonth = a.split('-')[0];
      const bMonth = b.split('-')[0];
      return monthOrder.indexOf(bMonth) - monthOrder.indexOf(aMonth);
    });
    if (sortedKeys.length > 0) {
      return { cropYearKey, monthKey: sortedKeys[0], data: months[sortedKeys[0]] };
    }
  }
  return null;
}

export function getAllMonthKeys(cropYearKey: string): string[] {
  const cropYear = getHistoricalData()[cropYearKey];
  if (!cropYear) return [];
  const monthOrder = ['aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul'];
  return Object.keys(cropYear.months).sort((a, b) => {
    const aMonth = a.split('-')[0];
    const bMonth = b.split('-')[0];
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });
}
