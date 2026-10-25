import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function InsightCard({
  icon: Icon,
  label,
  brand,
  value,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  brand: string;
  value: string;
  tone?: "primary" | "good" | "violet";
}) {
  const toneColor =
    tone === "good" ? "var(--status-good)" : tone === "violet" ? "var(--series-7)" : "var(--primary)";

  return (
    <Card size="sm" className="card-hover h-full">
      <CardContent>
        <div className="flex items-center gap-2">
          <span
            className={cn("flex size-8 items-center justify-center rounded-xl")}
            style={{ background: `color-mix(in oklch, ${toneColor}, transparent 85%)`, color: toneColor }}
          >
            <Icon className="size-4" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
        </div>
        <div className="mt-2 text-lg font-bold">{brand}</div>
        <div className="text-sm font-medium" style={{ color: toneColor }}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
