import { AreaChart, BarChart3, BarChartHorizontal, LineChart } from "lucide-react";

export type ChartType = "bar" | "barHorizontal" | "line" | "area";

export const CHART_TYPE_OPTIONS: { key: ChartType; label: string; Icon: typeof BarChart3 }[] = [
  { key: "bar", label: "Bar chart", Icon: BarChart3 },
  { key: "barHorizontal", label: "Horizontal bar chart", Icon: BarChartHorizontal },
  { key: "line", label: "Line chart", Icon: LineChart },
  { key: "area", label: "Area chart", Icon: AreaChart },
];
