import { unstable_cache } from "next/cache";

export type RsfPoint = { year: number; value: number };
export type RsfSeries = { latest: RsfPoint | null; history: RsfPoint[] };

/**
 * Reporters Without Borders publishes a per-year CSV of the World Press Freedom
 * Index at rsf.org/sites/default/files/import_classement/<year>.csv. The file
 * is semicolon-delimited with European decimal commas. Higher score = freer
 * press (post-2022 methodology). We track 2022→present so all rows use the
 * same scoring formula.
 *
 * For each country we cache the parsed series via unstable_cache so peer
 * comparison and world rank reuse a single fetch per year.
 */
const RSF_YEARS = [2022, 2023, 2024, 2025];

async function fetchRsfYearUncached(year: number): Promise<Map<string, number>> {
  const url = `https://rsf.org/sites/default/files/import_classement/${year}.csv`;
  const out = new Map<string, number>();
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`RSF ${year}: ${res.status}`);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return out;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(";");
      const iso = (cols[0] || "").replace(/﻿/g, "").trim();
      const score = Number((cols[1] || "").replace(",", "."));
      if (iso.length !== 3 || !Number.isFinite(score)) continue;
      out.set(iso, score);
    }
    return out;
  } catch {
    return out;
  }
}

const cachedYear = unstable_cache(
  async (year: number) => Array.from((await fetchRsfYearUncached(year)).entries()),
  ["rsf-year"],
  { revalidate: 60 * 60 * 24, tags: ["rsf"] },
);

export async function fetchRsfAllYears(): Promise<Map<string, RsfSeries>> {
  const yearMaps = await Promise.all(
    RSF_YEARS.map(async (y) => ({ year: y, entries: await cachedYear(y) })),
  );
  const out = new Map<string, RsfSeries>();
  for (const { year, entries } of yearMaps) {
    for (const [iso, value] of entries) {
      let bucket = out.get(iso);
      if (!bucket) {
        bucket = { latest: null, history: [] };
        out.set(iso, bucket);
      }
      bucket.history.push({ year, value });
    }
  }
  for (const bucket of out.values()) {
    bucket.history.sort((a, b) => a.year - b.year);
    bucket.latest = bucket.history.length ? bucket.history[bucket.history.length - 1] : null;
  }
  return out;
}
