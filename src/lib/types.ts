export const CHANNELS = [
  "1.Search",
  "2.Merch",
  "3.Monetisation",
  "4.Reco",
  "5.Others",
] as const;
export type Channel = (typeof CHANNELS)[number];

export type Platform = "App" | "Web";
export type MarketingChannel = "Organic" | "Inorganic";

export type FunnelRecord = {
  id: string;
  date: string; // ISO date, YYYY-MM-DD, derived from load_date
  year: number; // calendar year of `date`, used for YoY comparison
  brand: string;
  businessUnit: string;
  platform: Platform;
  marketingChannel: MarketingChannel;
  channel: string; // l0_classification — "1.Search" etc. in the demo data, any label from an uploaded sheet
  lv: number;
  pdp: number;
  atc: number;
  impressions: number;
};
