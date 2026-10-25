"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, GitCompareArrows } from "lucide-react";
import { useData } from "@/lib/data-context";
import { uniqueYears } from "@/lib/aggregations";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
];

export function AppHeader() {
  const pathname = usePathname();
  const { records, updatedAt } = useData();
  const hasData = records.length > 0;
  const [prevYear, currYear] = uniqueYears(records);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-6 py-5 sm:px-10">
        <div className="flex items-center gap-4">
          <span className="relative flex size-11 items-center justify-center">
            <span className="absolute inset-0 animate-pulse rounded-2xl bg-primary opacity-40 blur-md" />
            <span className="relative flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BarChart3 className="size-5" />
            </span>
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {hasData ? `PDP Performance: ${prevYear} vs ${currYear}` : "PDP Performance Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasData
                ? `${records.length.toLocaleString()} rows from your upload`
                : "Upload your sheet to see the dashboard"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasData && (
            <div className="flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground">
              <span className="relative flex size-2">
                <span
                  className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
                  style={{ background: "var(--status-good)" }}
                />
                <span
                  className="relative inline-flex size-2 rounded-full"
                  style={{ background: "var(--status-good)" }}
                />
              </span>
              Live{updatedAt && ` · updated ${updatedAt.toLocaleTimeString()}`}
            </div>
          )}
          <ModeToggle />
        </div>
      </div>

      <nav className="mx-auto w-full max-w-[1600px] px-6 sm:px-10">
        <div className="flex gap-1 border-t pt-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-t-lg px-3 py-2.5 text-sm font-medium transition-colors -mt-px border-b-2",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
