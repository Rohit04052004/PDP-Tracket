"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from "recharts";
import { YEAR_CURR_COLOR, YEAR_PREV_COLOR } from "@/lib/colors";
import { ComparisonTooltip, YearLegend, YoyDatum } from "./ComparisonShared";

function YoyLabel(labelProps: unknown) {
  const props = labelProps as { x?: unknown; y?: unknown; value?: unknown };
  const x = Number(props.x);
  const y = Number(props.y);
  const value = props.value === undefined || props.value === null ? undefined : Number(props.value);
  if (value === undefined || Number.isNaN(x) || Number.isNaN(y)) return null;
  const good = value >= 0;
  return (
    <text
      x={x}
      y={y - 12}
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

export function LineComparisonChart({
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
        <LineChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
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
            padding={{ left: 24, right: 24 }}
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
            cursor={{ stroke: "var(--axis)" }}
          />
          <Line
            type="monotone"
            dataKey="prev"
            name="prev"
            stroke={YEAR_PREV_COLOR}
            strokeWidth={2}
            dot={{ r: 4, fill: YEAR_PREV_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="curr"
            name="curr"
            stroke={YEAR_CURR_COLOR}
            strokeWidth={2}
            dot={{ r: 4, fill: YEAR_CURR_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          >
            <LabelList dataKey="yoyPct" content={YoyLabel} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
