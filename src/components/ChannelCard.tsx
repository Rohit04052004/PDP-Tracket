import { Card, CardContent } from "@/components/ui/card";
import { ChannelIcon } from "@/components/ChannelIcon";
import { TrendingDown, TrendingUp } from "lucide-react";

export function ChannelCard({
  label,
  color,
  prevYear,
  currYear,
  prevValue,
  currValue,
  yoyPct,
  mixCurrPct,
  mixDeltaPct,
  formatValue,
}: {
  label: string;
  color: string;
  prevYear: number;
  currYear: number;
  prevValue: number;
  currValue: number;
  yoyPct: number;
  mixCurrPct: number;
  mixDeltaPct: number;
  formatValue: (v: number) => string;
}) {
  const good = yoyPct >= 0;
  return (
    <Card size="sm" className="card-hover h-full">
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="flex size-6 items-center justify-center rounded-full"
              style={{ background: `color-mix(in oklch, ${color}, transparent 82%)`, color }}
            >
              <ChannelIcon label={label} className="size-3.5" />
            </span>
            <span className="text-sm font-semibold">{label}</span>
          </div>
          <span
            className="tabular flex items-center gap-0.5 text-xs font-semibold"
            style={{ color: good ? "var(--success-text)" : "var(--status-critical)" }}
          >
            {good ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {good ? "+" : ""}
            {yoyPct.toFixed(1)}%
          </span>
        </div>

        <div className="tabular mt-3 flex items-center gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">{prevYear}</div>
            <div>{formatValue(prevValue)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{currYear}</div>
            <div className="font-semibold">{formatValue(currValue)}</div>
          </div>
        </div>

        <div className="tabular mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Mix: {mixCurrPct.toFixed(1)}%</span>
          <span style={{ color: mixDeltaPct >= 0 ? "var(--success-text)" : "var(--status-critical)" }}>
            {mixDeltaPct >= 0 ? "+" : ""}
            {mixDeltaPct.toFixed(1)}pp
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
