import { ChannelShare } from "@/lib/aggregations";
import { stripChannelPrefix } from "@/lib/colors";

export function ChannelMixBar({
  shares,
  colorFor,
}: {
  shares: ChannelShare[];
  colorFor: (channel: string) => string;
}) {
  if (shares.length === 0) {
    return <div className="text-sm text-muted-foreground">No data for this year.</div>;
  }

  const top = shares[0];

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--gridline)" }}>
        {shares.map((s) => (
          <div
            key={s.channel}
            title={`${stripChannelPrefix(s.channel)}: ${s.pct.toFixed(1)}%`}
            style={{ width: `${s.pct}%`, background: colorFor(s.channel) }}
          />
        ))}
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground">
        Top:{" "}
        <span className="font-medium" style={{ color: colorFor(top.channel) }}>
          {stripChannelPrefix(top.channel)}
        </span>{" "}
        ({top.pct.toFixed(1)}%)
      </div>
    </div>
  );
}
