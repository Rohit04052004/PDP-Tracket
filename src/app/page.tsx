"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_FILTERS,
  Metric,
  METRIC_LABELS,
  brandBreakdown,
  channelBreakdown,
  channelRates,
  consolidatedStats,
  filterRecords,
  funnelStagesYoY,
  uniqueYears,
} from "@/lib/aggregations";
import { useData } from "@/lib/data-context";
import { formatCompactNumber } from "@/lib/format";
import { buildOrderedColorMap, stripChannelPrefix } from "@/lib/colors";
import { ConsolidatedCard } from "@/components/ConsolidatedCard";
import { ChannelCard } from "@/components/ChannelCard";
import { FilterBar } from "@/components/Filters";
import { ChartCard } from "@/components/ChartCard";
import { GroupedBarChart, YoyDatum } from "@/components/charts/GroupedBarChart";
import { HorizontalGroupedBarChart } from "@/components/charts/HorizontalGroupedBarChart";
import { LineComparisonChart } from "@/components/charts/LineComparisonChart";
import { AreaComparisonChart } from "@/components/charts/AreaComparisonChart";
import { ChannelMatrixTable } from "@/components/ChannelMatrixTable";
import { UploadPanel } from "@/components/UploadPanel";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UploadCloud } from "lucide-react";
import { CHART_TYPE_OPTIONS, ChartType } from "@/lib/chartTypeOptions";

type ViewMode = "channel" | "brand" | "funnel";

export default function Home() {
  const { records, setRecords, isImporting } = useData();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [metric, setMetric] = useState<Metric>("pdp");
  const [viewMode, setViewMode] = useState<ViewMode>("channel");
  const [chartType, setChartType] = useState<ChartType>("bar");

  const hasData = records.length > 0;

  const brands = useMemo(() => Array.from(new Set(records.map((r) => r.brand))).sort(), [records]);
  const businessUnits = useMemo(
    () => Array.from(new Set(records.map((r) => r.businessUnit))).sort(),
    [records]
  );
  const channelOrder = useMemo(
    () => Array.from(new Set(records.map((r) => r.channel))).sort(),
    [records]
  );
  const channelColors = useMemo(() => buildOrderedColorMap(channelOrder), [channelOrder]);

  const filtered = useMemo(() => filterRecords(records, filters), [records, filters]);
  const [prevYear, currYear] = useMemo(() => uniqueYears(filtered), [filtered]);

  const consolidated = useMemo(() => consolidatedStats(filtered, metric), [filtered, metric]);
  const channelRows = useMemo(
    () => channelBreakdown(filtered, metric, channelOrder),
    [filtered, metric, channelOrder]
  );
  const rates = useMemo(
    () => channelRates(filtered, currYear, channelOrder),
    [filtered, currYear, channelOrder]
  );
  const brandRows = useMemo(() => brandBreakdown(filtered, metric, 8), [filtered, metric]);
  const funnelRows = useMemo(() => funnelStagesYoY(filtered), [filtered]);

  const chartData: YoyDatum[] = useMemo(() => {
    if (viewMode === "channel") {
      return channelRows.map((r) => ({
        name: stripChannelPrefix(r.channel),
        prev: r.prev,
        curr: r.curr,
        yoyPct: r.yoyPct,
      }));
    }
    if (viewMode === "brand") {
      return brandRows.map((r) => ({ name: r.brand, prev: r.prev, curr: r.curr, yoyPct: r.yoyPct }));
    }
    return funnelRows;
  }, [viewMode, channelRows, brandRows, funnelRows]);

  function handleImport(newRecords: typeof records) {
    setRecords(newRecords);
    setFilters(DEFAULT_FILTERS);
  }

  function handleClear() {
    setRecords([]);
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-8 px-6 py-10 sm:px-10">
      <UploadPanel onImport={handleImport} onClear={handleClear} hasData={hasData} />

      {!hasData && (
        <Card className="animate-in fade-in-0 duration-500">
          <CardContent className="flex flex-col items-center gap-3 p-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="size-8" />
            </span>
            <p className="text-lg font-medium">
              No data yet — upload an Excel or CSV export above to see the dashboard.
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              Expected columns: load_date, brand, business_unit, platform, marketing_channel,
              l0_classification, lv, pdp, atc, impressions.
            </p>
          </CardContent>
        </Card>
      )}

      {hasData && isImporting && <DashboardSkeleton cardCount={channelOrder.length || 6} />}

      {hasData && !isImporting && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-1 space-y-8 duration-500">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            brands={brands}
            businessUnits={businessUnits}
            channels={channelOrder}
          />

          <ConsolidatedCard
            label={`Consolidated ${METRIC_LABELS[metric]}`}
            prevYear={consolidated.prevYear}
            currYear={consolidated.currYear}
            prevTotal={consolidated.prevTotal}
            currTotal={consolidated.currTotal}
            deltaAbs={consolidated.deltaAbs}
            yoyPct={consolidated.yoyPct}
            convRate={consolidated.convRate}
            formatValue={formatCompactNumber}
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {channelRows.map((r) => (
              <ChannelCard
                key={r.channel}
                label={stripChannelPrefix(r.channel)}
                color={channelColors(r.channel)}
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
            subtitle="Analyzing funnel behavior across touchpoint channels"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <ToggleGroup
                variant="outline"
                value={[viewMode]}
                onValueChange={(v) => {
                  if (v.length > 0) setViewMode(v[0] as ViewMode);
                }}
              >
                <ToggleGroupItem value="channel" className="pressed-glow">
                  By Channel
                </ToggleGroupItem>
                <ToggleGroupItem value="brand" className="pressed-glow">
                  Top Brands YoY
                </ToggleGroupItem>
                <ToggleGroupItem value="funnel" className="pressed-glow">
                  Funnel Stages
                </ToggleGroupItem>
              </ToggleGroup>

              <div className="flex items-center gap-2">
                {viewMode !== "funnel" && (
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
                )}

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
            title={`Touchpoint Channel ${METRIC_LABELS[metric]} Matrix (${prevYear} vs ${currYear})`}
            subtitle="Full comparison across all channels"
          >
            <ChannelMatrixTable
              rows={channelRows}
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
