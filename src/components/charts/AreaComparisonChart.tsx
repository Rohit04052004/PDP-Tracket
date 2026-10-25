"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { YEAR_CURR_COLOR, YEAR_PREV_COLOR } from "@/lib/colors";
import { ComparisonTooltip, YearLegend, YoyDatum } from "./ComparisonShared";

export function AreaComparisonChart({
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
        <AreaChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="areaPrev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={YEAR_PREV_COLOR} stopOpacity={0.35} />
              <stop offset="100%" stopColor={YEAR_PREV_COLOR} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="areaCurr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={YEAR_CURR_COLOR} stopOpacity={0.4} />
              <stop offset="100%" stopColor={YEAR_CURR_COLOR} stopOpacity={0.03} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="prev"
            name="prev"
            stroke={YEAR_PREV_COLOR}
            strokeWidth={2}
            fill="url(#areaPrev)"
            dot={{ r: 3, fill: YEAR_PREV_COLOR, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="curr"
            name="curr"
            stroke={YEAR_CURR_COLOR}
            strokeWidth={2}
            fill="url(#areaCurr)"
            dot={{ r: 3, fill: YEAR_CURR_COLOR, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
