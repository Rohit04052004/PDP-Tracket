"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Metric,
  METRIC_LABELS,
  brandComparison,
  brandRates,
  brandBreakdown,
  channelMixForBrand,
  uniqueYears,
} from "@/lib/aggregations";
import { useData } from "@/lib/data-context";
import { formatCompactNumber } from "@/lib/format";
import { buildOrderedColorMap } from "@/lib/colors";
import { CHART_TYPE_OPTIONS, ChartType } from "@/lib/chartTypeOptions";
import { BrandMultiSelect } from "@/components/BrandMultiSelect";
import { ChannelCard } from "@/components/ChannelCard";
import { ChannelMixBar } from "@/components/ChannelMixBar";
import { InsightCard } from "@/components/InsightCard";
import { ChartCard } from "@/components/ChartCard";
import { BrandMatrixTable } from "@/components/BrandMatrixTable";
import { GroupedBarChart, YoyDatum } from "@/components/charts/GroupedBarChart";
import { HorizontalGroupedBarChart } from "@/components/charts/HorizontalGroupedBarChart";
import { LineComparisonChart } from "@/components/charts/LineComparisonChart";
import { AreaComparisonChart } from "@/components/charts/AreaComparisonChart";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GitCompareArrows, Scale, Target, TrendingUp } from "lucide-react";

export default function ComparePage() {
  const { records } = useData();
  const hasData = records.length > 0;

  const allBrands = useMemo(() => Array.from(new Set(records.map((r) => r.brand))).sort(), [records]);
  const channelOrder = useMemo(
    () => Array.from(new Set(records.map((r) => r.channel))).sort(),
    [records]
  );
  const [prevYear, currYear] = useMemo(() => uniqueYears(records), [records]);

  const [selectedBrands, setSelectedBrands] = useState<string[]>(() =>
    brandBreakdown(records, "pdp", 5).map((r) => r.brand)
  );
  const [metric, setMetric] = useState<Metric>("pdp");
  const [chartType, setChartType] = useState<ChartType>("bar");

  const brandColors = useMemo(() => buildOrderedColorMap(selectedBrands), [selectedBrands]);
  const channelColors = useMemo(() => buildOrderedColorMap(channelOrder), [channelOrder]);

  const rows = useMemo(
    () => brandComparison(records, metric, selectedBrands),
    [records, metric, selectedBrands]
  );
  const rates = useMemo(
    () => brandRates(records, currYear, selectedBrands),
    [records, currYear, selectedBrands]
  );

  const chartData: YoyDatum[] = useMemo(
    () => rows.map((r) => ({ name: r.brand, prev: r.prev, curr: r.curr, yoyPct: r.yoyPct })),
    [rows]
  );

  const insights = useMemo(() => {
    if (rows.length < 2) return null;
    const fastestGrowth = [...rows].sort((a, b) => b.yoyPct - a.yoyPct)[0];
    const largest = [...rows].sort((a, b) => b.curr - a.curr)[0];
    const bestConversion = [...rates].sort((a, b) => b.pdpToAtcRate - a.pdpToAtcRate)[0];
    return { fastestGrowth, largest, bestConversion };
  }, [rows, rates]);

  if (!hasData) {
    return (
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-10 sm:px-10">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GitCompareArrows className="size-8" />
            </span>
            <p className="text-lg font-medium">No data yet to compare.</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Upload your sheet on the Dashboard first, then come back here to compare brands.
            </p>
            <Link href="/" className={buttonVariants({ className: "mt-2" })}>
              Go to Dashboard
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-8 px-6 py-10 sm:px-10">
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Compare brands</h2>
            <p className="text-sm text-muted-foreground">
              Pick any brands to compare {prevYear} vs {currYear} performance side by side.
            </p>
          </div>
          <BrandMultiSelect value={selectedBrands} onChange={setSelectedBrands} options={allBrands} />
        </CardContent>
      </Card>

      {selectedBrands.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            Select at least one brand above to see its stats.
          </CardContent>
        </Card>
      )}

      {selectedBrands.length > 0 && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-1 space-y-8 duration-500">
          {insights && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InsightCard
                icon={TrendingUp}
                label="Fastest growing"
                brand={insights.fastestGrowth.brand}
                value={`${insights.fastestGrowth.yoyPct >= 0 ? "+" : ""}${insights.fastestGrowth.yoyPct.toFixed(1)}% YoY`}
                tone="good"
              />
              <InsightCard
                icon={Scale}
                label={`Largest by ${METRIC_LABELS[metric]}`}
                brand={insights.largest.brand}
                value={formatCompactNumber(insights.largest.curr)}
                tone="primary"
              />
              <InsightCard
                icon={Target}
                label="Best PDP → ATC conversion"
                brand={insights.bestConversion.brand}
                value={`${insights.bestConversion.pdpToAtcRate.toFixed(1)}%`}
                tone="violet"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {rows.map((r) => (
              <ChannelCard
                key={r.brand}
                label={r.brand}
                color={brandColors(r.brand)}
                prevYear={prevYear}
                currYear={currYear}
                prevValue={r.prev}
                currValue={r.curr}
                yoyPct={r.yoyPct}
                mixCurrPct={r.mixCurrPct}
                mixDeltaPct={r.mixCurrPct - r.mixPrevPct}
                formatValue={formatCompactNumber}
              />
            ))}
          </div>

          <ChartCard
            title={`Visual Comparison: ${prevYear} vs ${currYear}`}
            subtitle="Selected brands side by side"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <ToggleGroup
                variant="outline"
                value={[metric]}
                onValueChange={(v) => {
                  if (v.length > 0) setMetric(v[0] as Metric);
                }}
              >
                {(["pdp", "lv", "atc", "impressions"] as Metric[]).map((m) => (
                  <ToggleGroupItem key={m} value={m} className="pressed-glow">
                    {METRIC_LABELS[m]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <ToggleGroup
                variant="outline"
                value={[chartType]}
                onValueChange={(v) => {
                  if (v.length > 0) setChartType(v[0] as ChartType);
                }}
              >
                {CHART_TYPE_OPTIONS.map(({ key, label, Icon }) => (
                  <ToggleGroupItem key={key} value={key} aria-label={label} className="pressed-glow">
                    <Icon className="size-4" />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {chartType === "bar" && (
              <GroupedBarChart
                data={chartData}
                prevLabel={`${prevYear} Baseline`}
                currLabel={`${currYear} Comparison`}
                formatValue={formatCompactNumber}
              />
            )}
            {chartType === "barHorizontal" && (
              <HorizontalGroupedBarChart
                data={chartData}
                prevLabel={`${prevYear} Baseline`}
                currLabel={`${currYear} Comparison`}
                formatValue={formatCompactNumber}
              />
            )}
            {chartType === "line" && (
              <LineComparisonChart
                data={chartData}
                prevLabel={`${prevYear} Baseline`}
                currLabel={`${currYear} Comparison`}
                formatValue={formatCompactNumber}
              />
            )}
            {chartType === "area" && (
              <AreaComparisonChart
                data={chartData}
                prevLabel={`${prevYear} Baseline`}
                currLabel={`${currYear} Comparison`}
                formatValue={formatCompactNumber}
              />
            )}
          </ChartCard>

          <ChartCard
            title="Where each brand's traffic comes from"
            subtitle={`${currYear} channel mix by ${METRIC_LABELS[metric]}`}
          >
            <div className="space-y-5">
              {selectedBrands.map((brand) => (
                <div key={brand}>
                  <div className="mb-1.5 text-sm font-medium">{brand}</div>
                  <ChannelMixBar
                    shares={channelMixForBrand(records, metric, brand, currYear, channelOrder)}
                    colorFor={channelColors}
                  />
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title={`Brand ${METRIC_LABELS[metric]} Matrix (${prevYear} vs ${currYear})`}
            subtitle="Full comparison across selected brands"
          >
            <BrandMatrixTable
              rows={rows}
              rates={rates}
              prevYear={prevYear}
              currYear={currYear}
              valueLabel={METRIC_LABELS[metric]}
              formatValue={formatCompactNumber}
            />
          </ChartCard>
        </div>
      )}
    </main>
  );
}
