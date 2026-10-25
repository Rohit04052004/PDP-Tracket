# PDP Performance Dashboard

A live, upload-your-own-data dashboard for analyzing PDP (product detail page) funnel
performance — Impressions → Listing Views → PDP Views → Add-to-Cart — across touchpoint
channels and brands, with year-over-year comparisons.

**Live demo:** [abhijeettracker.vercel.app](https://abhijeettracker.vercel.app)

No backend, no database — everything runs client-side in the browser. Upload a file,
see the dashboard. Nothing is uploaded to a server.

## Features

- **Upload Excel, CSV, or PDF** — drag-and-drop, with automatic column mapping (and a
  manual override if auto-detection misses a column)
- **Dashboard** — consolidated YoY stats, per-channel breakdowns, a touchpoint channel
  matrix (LV→PDP and PDP→ATC conversion rates), all filterable by brand, business unit,
  platform, and marketing channel
- **Compare page** — pick any brands to compare side by side: YoY growth leaders,
  largest by volume, best converters, and each brand's channel mix
- **Four chart types** for every comparison — bar, horizontal bar, line, area
- **Dark/light theme**, loading progress on upload, skeleton states on import

## Expected columns

The uploader looks for these columns (by name, with some fuzzy matching for near-misses
like `IO_classification` vs `l0_classification`):

| Column | Required | Notes |
|---|---|---|
| `load_date` | yes | `YYYYMMDD`, Excel date, or plain date string |
| `brand` | yes | |
| `l0_classification` | yes | touchpoint channel, e.g. `1.Search`, `2.Merch` |
| `pdp` | yes | PDP views |
| `business_unit` | no | |
| `platform` | no | `App` / `Web` |
| `marketing_channel` | no | `Organic` / `Inorganic` |
| `lv` | no | listing views |
| `atc` | no | add-to-cart |
| `impressions` | no | |

## Tech stack

- [Next.js](https://nextjs.org) (App Router, Turbopack) + TypeScript
- [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com) primitives
- [Recharts](https://recharts.org) for charts
- [SheetJS (xlsx)](https://sheetjs.com) for Excel/CSV parsing, [pdf.js](https://mozilla.github.io/pdf.js/) for PDF table extraction
- Deployed on [Vercel](https://vercel.com)

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
