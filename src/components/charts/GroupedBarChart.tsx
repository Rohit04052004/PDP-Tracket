"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { YEAR_CURR_COLOR, YEAR_PREV_COLOR } from "@/lib/colors";
import { ComparisonTooltip, YearLegend, YoyDatum } from "./ComparisonShared";

export type { YoyDatum };

function YoyLabel(labelProps: unknown) {
  const props = labelProps as { x?: unknown; y?: unknown; width?: unknown; value?: unknown };
  const x = Number(props.x);
  const y = Number(props.y);
  const width = Number(props.width);
  const value = props.value === undefined || props.value === null ? undefined : Number(props.value);
  if (value === undefined || Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(width)) return null;
  const good = value >= 0;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fontSize={12}
      fontWeight={600}
      fill={good ? "var(--success-text)" : "var(--status-critical)"}
    >
      {good ? "+" : ""}
      {value.toFixed(1)}%
    </text>
  );
}

export function GroupedBarChart({
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
  return (
    <div>
      <YearLegend prevLabel={prevLabel} currLabel={currLabel} />
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            axisLine={{ stroke: "var(--axis)" }}
            tickLine={false}
            interval={0}
            angle={data.length > 5 ? -20 : 0}
            textAnchor={data.length > 5 ? "end" : "middle"}
            height={data.length > 5 ? 50 : 30}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={formatValue}
          />
          <Tooltip
            content={<ComparisonTooltip prevLabel={prevLabel} currLabel={currLabel} formatValue={formatValue} />}
            cursor={{ fill: "var(--gridline)" }}
          />
          <Bar dataKey="prev" name="prev" fill={YEAR_PREV_COLOR} radius={[4, 4, 0, 0]} />
          <Bar dataKey="curr" name="curr" fill={YEAR_CURR_COLOR} radius={[4, 4, 0, 0]}>
            <LabelList dataKey="yoyPct" content={YoyLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
