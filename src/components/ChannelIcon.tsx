import { DollarSign, Layers, MoreHorizontal, Search, ShoppingBag, Sparkles } from "lucide-react";

export function ChannelIcon({ label, className }: { label: string; className?: string }) {
  const key = label.toLowerCase();
  if (key.includes("search")) return <Search className={className} />;
  if (key.includes("merch")) return <ShoppingBag className={className} />;
  if (key.includes("moneti")) return <DollarSign className={className} />;
  if (key.includes("reco")) return <Sparkles className={className} />;
  if (key.includes("other")) return <MoreHorizontal className={className} />;
  return <Layers className={className} />;
}
