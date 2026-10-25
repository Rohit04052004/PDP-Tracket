"use client";

import { DashboardFilters } from "@/lib/aggregations";
import { stripChannelPrefix } from "@/lib/colors";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/Combobox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function FilterBar({
  filters,
  onChange,
  brands,
  businessUnits,
  channels,
}: {
  filters: DashboardFilters;
  onChange: (f: DashboardFilters) => void;
  brands: string[];
  businessUnits: string[];
  channels: string[];
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <ToggleGroup
          variant="outline"
          value={[filters.channel]}
          onValueChange={(v) => {
            if (v.length > 0) onChange({ ...filters, channel: v[0] });
          }}
          className="flex-wrap"
        >
          <ToggleGroupItem value="All" aria-label="All channels" className="pressed-glow">
            All Channels
          </ToggleGroupItem>
          {channels.map((c) => (
            <ToggleGroupItem key={c} value={c} aria-label={c} className="pressed-glow">
              {stripChannelPrefix(c)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex flex-wrap gap-2">
          <Combobox
            value={filters.brand}
            onChange={(v) => onChange({ ...filters, brand: v })}
            allLabel="All brands"
            options={brands}
            placeholder="Search brands..."
          />
          <Combobox
            value={filters.businessUnit}
            onChange={(v) => onChange({ ...filters, businessUnit: v })}
            allLabel="All business units"
            options={businessUnits}
            placeholder="Search business units..."
          />
          <Combobox
            value={filters.platform}
            onChange={(v) => onChange({ ...filters, platform: v })}
            allLabel="All platforms"
            options={["App", "Web"]}
            placeholder="Search platforms..."
          />
          <Combobox
            value={filters.marketingChannel}
            onChange={(v) => onChange({ ...filters, marketingChannel: v })}
            allLabel="Organic & Inorganic"
            options={["Organic", "Inorganic"]}
            placeholder="Search..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
