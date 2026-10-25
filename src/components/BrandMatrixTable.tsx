import { BrandComparisonRow, BrandRates } from "@/lib/aggregations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function BrandMatrixTable({
  rows,
  rates,
  prevYear,
  currYear,
  valueLabel,
  formatValue,
}: {
  rows: BrandComparisonRow[];
  rates: BrandRates[];
  prevYear: number;
  currYear: number;
  valueLabel: string;
  formatValue: (v: number) => string;
}) {
  const rateFor = (brand: string) => rates.find((r) => r.brand === brand);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Brand</TableHead>
          <TableHead className="tabular text-right">
            {prevYear} {valueLabel}
          </TableHead>
          <TableHead className="tabular text-right">{prevYear} Share</TableHead>
          <TableHead className="tabular text-right">
            {currYear} {valueLabel}
          </TableHead>
          <TableHead className="tabular text-right">{currYear} Share</TableHead>
          <TableHead className="tabular text-right">YoY</TableHead>
          <TableHead className="tabular text-right">LV→PDP</TableHead>
          <TableHead className="tabular text-right">PDP→ATC</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const rate = rateFor(r.brand);
          return (
            <TableRow key={r.brand}>
              <TableCell className="font-medium">{r.brand}</TableCell>
              <TableCell className="tabular text-right text-muted-foreground">
                {formatValue(r.prev)}
              </TableCell>
              <TableCell className="tabular text-right text-muted-foreground">
                {r.mixPrevPct.toFixed(1)}%
              </TableCell>
              <TableCell className="tabular text-right font-semibold">{formatValue(r.curr)}</TableCell>
              <TableCell className="tabular text-right text-muted-foreground">
                {r.mixCurrPct.toFixed(1)}%
              </TableCell>
              <TableCell
                className="tabular text-right font-semibold"
                style={{ color: r.yoyPct >= 0 ? "var(--success-text)" : "var(--status-critical)" }}
              >
                {r.yoyPct >= 0 ? "+" : ""}
                {r.yoyPct.toFixed(1)}%
              </TableCell>
              <TableCell className="tabular text-right text-muted-foreground">
                {rate ? `${rate.lvToPdpRate.toFixed(1)}%` : "—"}
              </TableCell>
              <TableCell className="tabular text-right text-muted-foreground">
                {rate ? `${rate.pdpToAtcRate.toFixed(1)}%` : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
