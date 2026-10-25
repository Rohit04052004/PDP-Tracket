"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from "recharts";
import { YEAR_CURR_COLOR, YEAR_PREV_COLOR } from "@/lib/colors";
import { ComparisonTooltip, YearLegend, YoyDatum } from "./ComparisonShared";

function YoyLabel(labelProps: unknown) {
  const props = labelProps as { x?: unknown; y?: unknown; width?: unknown; height?: unknown; value?: unknown };
  const x = Number(props.x);
  const y = Number(props.y);
  const width = Number(props.width);
  const height = Number(props.height);
  const value = props.value === undefined || props.value === null ? undefined : Number(props.value);
  if (value === undefined || [x, y, width, height].some(Number.isNaN)) return null;
  const good = value >= 0;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      fontSize={12}
      fontWeight={600}
      fill={good ? "var(--success-text)" : "var(--status-critical)"}
    >
      {good ? "+" : ""}
      {value.toFixed(1)}%
    </text>
  );
}

export function HorizontalGroupedBarChart({
  data,
  prevLabel,
  currLabel,
  formatValue,
}: {
  data: YoyDatum[];
  prevLabel: string;
  currLabel: string;
  formatValue: (v: number) => string;
}) {
  const height = Math.max(260, data.length * 72);
  return (
    <div>
      <YearLegend prevLabel={prevLabel} currLabel={currLabel} />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 56, left: 8, bottom: 4 }}
          barGap={4}
        >
          <CartesianGrid horizontal={false} stroke="var(--gridline)" />
          <XAxis
            type="number"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatValue}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip
            content={<ComparisonTooltip prevLabel={prevLabel} currLabel={currLabel} formatValue={formatValue} />}
            cursor={{ fill: "var(--gridline)" }}
          />
          <Bar dataKey="prev" name="prev" fill={YEAR_PREV_COLOR} radius={[0, 4, 4, 0]} />
          <Bar dataKey="curr" name="curr" fill={YEAR_CURR_COLOR} radius={[0, 4, 4, 0]}>
            <LabelList dataKey="yoyPct" content={YoyLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
