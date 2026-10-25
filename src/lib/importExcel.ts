import * as XLSX from "xlsx";
import { FunnelRecord, MarketingChannel, Platform } from "./types";

export type RawRow = Record<string, unknown>;

export type FieldKey =
  | "date"
  | "brand"
  | "businessUnit"
  | "platform"
  | "marketingChannel"
  | "channel"
  | "lv"
  | "pdp"
  | "atc"
  | "impressions";

export const REQUIRED_FIELDS: FieldKey[] = ["date", "brand", "channel", "pdp"];
export const OPTIONAL_FIELDS: FieldKey[] = [
  "businessUnit",
  "platform",
  "marketingChannel",
  "lv",
  "atc",
  "impressions",
];
export const ALL_FIELDS: FieldKey[] = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

const SYNONYMS: Record<FieldKey, string[]> = {
  date: ["load_date", "date", "load date"],
  brand: ["brand"],
  businessUnit: ["business_unit", "business unit", "bu"],
  platform: ["platform"],
  marketingChannel: ["marketing_channel", "marketing channel"],
  channel: [
    "l0_classification",
    "l0 classification",
    "io_classification",
    "io classification",
    "lo_classification",
    "lo classification",
    "classification",
    "channel",
    "touchpoint",
    "touchpoint channel",
  ],
  lv: ["lv"],
  pdp: ["pdp"],
  atc: ["atc"],
  impressions: ["impressions", "imp"],
};

function normalize(s: string) {
  return s
    .replace(/^\uFEFF/, "") // strip a leading BOM some CSV exports include
    .trim()
    .toLowerCase()
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function parseWorkbook(buffer: ArrayBuffer): { headers: string[]; rows: RawRow[] } {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows };
}

// Best-effort auto-mapping from sheet headers to our schema fields. Tries an
// exact normalized match first, then falls back to a substring match (e.g. a
// header like "io_classification" or "l0_classification_v2" still matches
// the "classification" synonym) so odd real-world header spellings still map.
export function autoMapHeaders(headers: string[]): Partial<Record<FieldKey, string>> {
  const mapping: Partial<Record<FieldKey, string>> = {};
  const normalizedHeaders = headers.map((h) => ({ raw: h, norm: normalize(h) }));
  const used = new Set<string>();

  for (const field of ALL_FIELDS) {
    const candidates = SYNONYMS[field];
    const exact = normalizedHeaders.find((h) => !used.has(h.raw) && candidates.includes(h.norm));
    if (exact) {
      mapping[field] = exact.raw;
      used.add(exact.raw);
    }
  }

  for (const field of ALL_FIELDS) {
    if (mapping[field]) continue;
    const candidates = SYNONYMS[field];
    const fuzzy = normalizedHeaders.find(
      (h) => !used.has(h.raw) && candidates.some((c) => h.norm.includes(c) || c.includes(h.norm))
    );
    if (fuzzy) {
      mapping[field] = fuzzy.raw;
      used.add(fuzzy.raw);
    }
  }

  return mapping;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[,$\s]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

// Handles load_date formats seen in real exports: an 8-digit YYYYMMDD
// integer (not an Excel serial date — those numbers are far smaller), an
// Excel serial date, or a plain date string.
function toDateString(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);

  if (typeof v === "number") {
    if (v >= 10_000_000 && v <= 99_999_999) {
      const s = String(v);
      const y = s.slice(0, 4);
      const m = s.slice(4, 6);
      const d = s.slice(6, 8);
      const dt = new Date(`${y}-${m}-${d}`);
      if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
    }
    const parsed = XLSX.SSF.parse_date_code(v);
    if (parsed) {
      const dt = new Date(parsed.y, parsed.m - 1, parsed.d);
      return dt.toISOString().slice(0, 10);
    }
  }

  if (typeof v === "string") {
    const digitsOnly = v.trim();
    if (/^\d{8}$/.test(digitsOnly)) return toDateString(Number(digitsOnly));
    const parsed = new Date(v);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }

  return "";
}

export function mapRowsToRecords(
  rows: RawRow[],
  mapping: Partial<Record<FieldKey, string>>
): { records: FunnelRecord[]; skipped: number } {
  const records: FunnelRecord[] = [];
  let skipped = 0;

  rows.forEach((row, idx) => {
    const dateCol = mapping.date;
    const brandCol = mapping.brand;
    const channelCol = mapping.channel;
    const pdpCol = mapping.pdp;
    if (!dateCol || !brandCol || !channelCol || !pdpCol) {
      skipped++;
      return;
    }

    const date = toDateString(row[dateCol]);
    const brand = String(row[brandCol] ?? "").trim();
    const channel = String(row[channelCol] ?? "").trim();
    const pdp = toNumber(row[pdpCol]);

    if (!date || !brand || !channel) {
      skipped++;
      return;
    }

    const platformRaw = mapping.platform ? String(row[mapping.platform] ?? "").trim() : "";
    const marketingChannelRaw = mapping.marketingChannel
      ? String(row[mapping.marketingChannel] ?? "").trim()
      : "";

    records.push({
      id: `U${idx.toString().padStart(6, "0")}`,
      date,
      year: new Date(date).getFullYear(),
      brand,
      businessUnit: mapping.businessUnit
        ? String(row[mapping.businessUnit] ?? "Unknown").trim() || "Unknown"
        : "Unknown",
      platform: (platformRaw === "Web" ? "Web" : "App") as Platform,
      marketingChannel: (marketingChannelRaw === "Inorganic" ? "Inorganic" : "Organic") as MarketingChannel,
      channel,
      lv: mapping.lv ? toNumber(row[mapping.lv]) : 0,
      pdp,
      atc: mapping.atc ? toNumber(row[mapping.atc]) : 0,
      impressions: mapping.impressions ? toNumber(row[mapping.impressions]) : 0,
    });
  });

  return { records, skipped };
}
