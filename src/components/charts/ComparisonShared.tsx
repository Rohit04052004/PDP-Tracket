import { YEAR_CURR_COLOR, YEAR_PREV_COLOR } from "@/lib/colors";

export type YoyDatum = { name: string; prev: number; curr: number; yoyPct: number };

export function YearLegend({ prevLabel, currLabel }: { prevLabel: string; currLabel: string }) {
  return (
    <div className="mb-2 flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: YEAR_PREV_COLOR }} />
        {prevLabel}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: YEAR_CURR_COLOR }} />
        {currLabel}
      </span>
    </div>
  );
}

export function ComparisonTooltip({
  active,
  payload,
  prevLabel,
  currLabel,
  formatValue,
}: {
  active?: boolean;
  payload?: { payload: YoyDatum }[];
  prevLabel: string;
  currLabel: string;
  formatValue: (v: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-sm shadow-sm"
      style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
    >
      <div className="mb-1 font-semibold" style={{ color: "var(--text-primary)" }}>
        {d.name}
      </div>
      <div className="tabular flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: YEAR_PREV_COLOR }} />
        {prevLabel}: {formatValue(d.prev)}
      </div>
      <div className="tabular flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: YEAR_CURR_COLOR }} />
        {currLabel}: {formatValue(d.curr)}
      </div>
      <div
        className="tabular mt-1 font-semibold"
        style={{ color: d.yoyPct >= 0 ? "var(--success-text)" : "var(--status-critical)" }}
      >
        {d.yoyPct >= 0 ? "+" : ""}
        {d.yoyPct.toFixed(1)}% YoY
      </div>
    </div>
  );
}
