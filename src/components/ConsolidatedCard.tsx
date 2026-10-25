import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";

export function ConsolidatedCard({
  label,
  prevYear,
  currYear,
  prevTotal,
  currTotal,
  deltaAbs,
  yoyPct,
  convRate,
  formatValue,
}: {
  label: string;
  prevYear: number;
  currYear: number;
  prevTotal: number;
  currTotal: number;
  deltaAbs: number;
  yoyPct: number;
  convRate: number;
  formatValue: (v: number) => string;
}) {
  const good = yoyPct >= 0;
  return (
    <Card
      className="glow-primary border-0 text-primary-foreground ring-0"
      style={{
        background:
          "linear-gradient(120deg, var(--primary), color-mix(in oklch, var(--primary), black 25%) 70%, color-mix(in oklch, var(--series-7), var(--primary) 40%))",
      }}
    >
      <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15">
            <BarChart3 className="size-5" />
          </span>
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase opacity-80">{label}</div>
            <Badge className="tabular mt-1 gap-1 bg-white/18 text-primary-foreground">
              {good ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {good ? "+" : ""}
              {yoyPct.toFixed(1)}% YoY
            </Badge>
          </div>
        </div>

        <div className="flex items-end gap-10">
          <div>
            <div className="text-xs opacity-70">{prevYear}</div>
            <div className="tabular text-3xl font-semibold opacity-85">{formatValue(prevTotal)}</div>
          </div>
          <div>
            <div className="text-xs opacity-70">{currYear}</div>
            <div className="tabular text-5xl font-bold tracking-tight">{formatValue(currTotal)}</div>
          </div>
        </div>

        <div className="tabular flex items-center gap-8 text-sm opacity-90">
          <div>
            <div className="text-xs opacity-70">Delta</div>
            <div className="font-semibold">
              {deltaAbs >= 0 ? "+" : ""}
              {formatValue(deltaAbs)}
            </div>
          </div>
          <div>
            <div className="text-xs opacity-70">Conv (ATC/PDP)</div>
            <div className="font-semibold">{convRate.toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
