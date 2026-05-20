# India Index

A live dashboard tracking India's standing across 26 global indices — economy, health, freedom, environment, hunger, and more — benchmarked against its South Asian neighbours.

**100% live data. No hardcoded snapshots.** Concerning indices (where India ranks worst in South Asia) are highlighted to spark curiosity.

## Data sources

All data is fetched at request time and cached for 24 hours.

- **World Bank Open Data API** — GDP, unemployment, Gini, inflation, literacy, education spend, life expectancy, infant mortality, health spend, stunting, PM2.5, CO₂/capita, forest cover, internet, R&D spend, mobile, extreme poverty
- **Our World in Data (OWID)** — HDI, civil liberties (Freedom House), press freedom (RSF), Democracy Index (EIU), liberal democracy (V-Dem), corruption (Transparency Intl.), rule of law (WJP), Global Hunger Index, Cantril ladder happiness (WHR)

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

The first request takes a few seconds while it fetches all sources; subsequent requests hit the in-memory cache (24h TTL).

## Deploy

### Vercel (recommended)

```bash
npx vercel
```

The repo includes `vercel.json` with a daily cron job that hits `/api/cron/refresh` at 03:00 UTC to revalidate every page.

**Required env var (recommended):**

- `CRON_SECRET` — any random string. Vercel Cron will pass it as `Authorization: Bearer <secret>` automatically. The endpoint refuses requests without it when the var is set.

### Anywhere else

The site builds to a standard Next.js app (no edge-only features). For a host without scheduled jobs, run a daily cron from anywhere that hits `https://your-domain/api/cron/refresh` with the bearer secret.

## Adding an index

Edit `lib/indices.ts`. Each index has a `fetcher` of `kind: "wb"` (World Bank indicator code) or `kind: "owid"` (OWID grapher slug). The data layer handles peer comparison and history automatically.
