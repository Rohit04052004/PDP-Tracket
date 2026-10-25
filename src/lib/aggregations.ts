import { FunnelRecord } from "./types";

export type Metric = "pdp" | "lv" | "atc" | "impressions";

export const METRIC_LABELS: Record<Metric, string> = {
  pdp: "PDP Views",
  lv: "LV",
  atc: "ATC",
  impressions: "Imp",
};

export type DashboardFilters = {
  brand: string; // "All" or a brand name
  businessUnit: string; // "All" or a business unit
  platform: string; // "All" | "App" | "Web"
  marketingChannel: string; // "All" | "Organic" | "Inorganic"
  channel: string; // "All" or a Channel
};

export const DEFAULT_FILTERS: DashboardFilters = {
  brand: "All",
  businessUnit: "All",
  platform: "All",
  marketingChannel: "All",
  channel: "All",
};

export function filterRecords(
  records: FunnelRecord[],
  filters: DashboardFilters
): FunnelRecord[] {
  return records.filter((r) => {
    if (filters.brand !== "All" && r.brand !== filters.brand) return false;
    if (filters.businessUnit !== "All" && r.businessUnit !== filters.businessUnit) return false;
    if (filters.platform !== "All" && r.platform !== filters.platform) return false;
    if (filters.marketingChannel !== "All" && r.marketingChannel !== filters.marketingChannel)
      return false;
    if (filters.channel !== "All" && r.channel !== filters.channel) return false;
    return true;
  });
}

// Falls back to 0 for an empty dataset — callers only read these once records
// are present, and a fixed fallback avoids a non-deterministic `new Date()`
// during render (Next's cacheComponents forbids that in a Client Component).
export function uniqueYears(records: FunnelRecord[]): [number, number] {
  const years = Array.from(new Set(records.map((r) => r.year))).sort((a, b) => a - b);
  const prev = years[0] ?? 0;
  const curr = years[years.length - 1] ?? 0;
  return [prev, curr];
}

function sum(records: FunnelRecord[], metric: Metric) {
  return records.reduce((s, r) => s + r[metric], 0);
}

export function consolidatedStats(records: FunnelRecord[], metric: Metric) {
  const [prevYear, currYear] = uniqueYears(records);
  const prevRecords = records.filter((r) => r.year === prevYear);
  const currRecords = records.filter((r) => r.year === currYear);
  const prevTotal = sum(prevRecords, metric);
  const currTotal = sum(currRecords, metric);
  const deltaAbs = currTotal - prevTotal;
  const yoyPct = prevTotal === 0 ? 0 : (deltaAbs / prevTotal) * 100;
  const currPdp = sum(currRecords, "pdp");
  const currAtc = sum(currRecords, "atc");
  const convRate = currPdp === 0 ? 0 : (currAtc / currPdp) * 100;

  return { prevYear, currYear, prevTotal, currTotal, deltaAbs, yoyPct, convRate };
}

export type ChannelRow = {
  channel: string;
  prev: number;
  curr: number;
  yoyPct: number;
  mixPrevPct: number;
  mixCurrPct: number;
};

export function channelBreakdown(
  records: FunnelRecord[],
  metric: Metric,
  channelOrder: string[]
): ChannelRow[] {
  const [prevYear, currYear] = uniqueYears(records);
  const prevRecords = records.filter((r) => r.year === prevYear);
  const currRecords = records.filter((r) => r.year === currYear);
  const prevTotalAll = sum(prevRecords, metric);
  const currTotalAll = sum(currRecords, metric);

  return channelOrder.map((channel) => {
    const prev = sum(prevRecords.filter((r) => r.channel === channel), metric);
    const curr = sum(currRecords.filter((r) => r.channel === channel), metric);
    const yoyPct = prev === 0 ? 0 : ((curr - prev) / prev) * 100;
    const mixPrevPct = prevTotalAll === 0 ? 0 : (prev / prevTotalAll) * 100;
    const mixCurrPct = currTotalAll === 0 ? 0 : (curr / currTotalAll) * 100;
    return { channel, prev, curr, yoyPct, mixPrevPct, mixCurrPct };
  });
}

export type BrandRow = { brand: string; prev: number; curr: number; yoyPct: number };

export function brandBreakdown(records: FunnelRecord[], metric: Metric, topN = 8): BrandRow[] {
  const [prevYear, currYear] = uniqueYears(records);
  const prevRecords = records.filter((r) => r.year === prevYear);
  const currRecords = records.filter((r) => r.year === currYear);

  const currByBrand = new Map<string, number>();
  for (const r of currRecords) {
    currByBrand.set(r.brand, (currByBrand.get(r.brand) ?? 0) + r[metric]);
  }
  const prevByBrand = new Map<string, number>();
  for (const r of prevRecords) {
    prevByBrand.set(r.brand, (prevByBrand.get(r.brand) ?? 0) + r[metric]);
  }

  return Array.from(currByBrand.entries())
    .map(([brand, curr]) => {
      const prev = prevByBrand.get(brand) ?? 0;
      const yoyPct = prev === 0 ? 0 : ((curr - prev) / prev) * 100;
      return { brand, prev, curr, yoyPct };
    })
    .sort((a, b) => b.curr - a.curr)
    .slice(0, topN);
}

export type ChannelRates = { channel: string; lvToPdpRate: number; pdpToAtcRate: number };

export function channelRates(
  records: FunnelRecord[],
  year: number,
  channelOrder: string[]
): ChannelRates[] {
  const yearRecords = records.filter((r) => r.year === year);
  return channelOrder.map((channel) => {
    const rows = yearRecords.filter((r) => r.channel === channel);
    const lv = sum(rows, "lv");
    const pdp = sum(rows, "pdp");
    const atc = sum(rows, "atc");
    return {
      channel,
      lvToPdpRate: lv === 0 ? 0 : (pdp / lv) * 100,
      pdpToAtcRate: pdp === 0 ? 0 : (atc / pdp) * 100,
    };
  });
}

export type BrandComparisonRow = {
  brand: string;
  prev: number;
  curr: number;
  yoyPct: number;
  mixPrevPct: number;
  mixCurrPct: number;
};

// Like channelBreakdown, but for an arbitrary analyst-picked set of brands
// rather than a fixed, data-derived order — mix% is still measured against
// the whole dataset so it reads as "share of total business", not just
// share among the brands currently selected.
export function brandComparison(
  records: FunnelRecord[],
  metric: Metric,
  brands: string[]
): BrandComparisonRow[] {
  const [prevYear, currYear] = uniqueYears(records);
  const prevRecords = records.filter((r) => r.year === prevYear);
  const currRecords = records.filter((r) => r.year === currYear);
  const prevTotalAll = sum(prevRecords, metric);
  const currTotalAll = sum(currRecords, metric);

  return brands
    .map((brand) => {
      const prev = sum(prevRecords.filter((r) => r.brand === brand), metric);
      const curr = sum(currRecords.filter((r) => r.brand === brand), metric);
      const yoyPct = prev === 0 ? 0 : ((curr - prev) / prev) * 100;
      const mixPrevPct = prevTotalAll === 0 ? 0 : (prev / prevTotalAll) * 100;
      const mixCurrPct = currTotalAll === 0 ? 0 : (curr / currTotalAll) * 100;
      return { brand, prev, curr, yoyPct, mixPrevPct, mixCurrPct };
    })
    .sort((a, b) => b.curr - a.curr);
}

export type BrandRates = { brand: string; lvToPdpRate: number; pdpToAtcRate: number };

export function brandRates(records: FunnelRecord[], year: number, brands: string[]): BrandRates[] {
  const yearRecords = records.filter((r) => r.year === year);
  return brands.map((brand) => {
    const rows = yearRecords.filter((r) => r.brand === brand);
    const lv = sum(rows, "lv");
    const pdp = sum(rows, "pdp");
    const atc = sum(rows, "atc");
    return {
      brand,
      lvToPdpRate: lv === 0 ? 0 : (pdp / lv) * 100,
      pdpToAtcRate: pdp === 0 ? 0 : (atc / pdp) * 100,
    };
  });
}

export type ChannelShare = { channel: string; value: number; pct: number };

// Per-brand channel mix for the current year — answers "where does this
// brand's traffic actually come from", which a flat totals table can't show.
export function channelMixForBrand(
  records: FunnelRecord[],
  metric: Metric,
  brand: string,
  year: number,
  channelOrder: string[]
): ChannelShare[] {
  const rows = records.filter((r) => r.brand === brand && r.year === year);
  const total = sum(rows, metric);
  return channelOrder
    .map((channel) => {
      const value = sum(rows.filter((r) => r.channel === channel), metric);
      return { channel, value, pct: total === 0 ? 0 : (value / total) * 100 };
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function funnelStagesYoY(records: FunnelRecord[]) {
  const [prevYear, currYear] = uniqueYears(records);
  const prevRecords = records.filter((r) => r.year === prevYear);
  const currRecords = records.filter((r) => r.year === currYear);
  const stages: { metric: Metric; label: string }[] = [
    { metric: "impressions", label: "Impressions" },
    { metric: "lv", label: "LV" },
    { metric: "pdp", label: "PDP" },
    { metric: "atc", label: "ATC" },
  ];

  return stages.map(({ metric, label }) => {
    const prev = sum(prevRecords, metric);
    const curr = sum(currRecords, metric);
    const yoyPct = prev === 0 ? 0 : ((curr - prev) / prev) * 100;
    return { name: label, prev, curr, yoyPct };
  });
}
