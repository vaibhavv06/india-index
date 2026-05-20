import { unstable_cache } from "next/cache";

export type WBPoint = { year: number; value: number };
export type WBSeries = { latest: WBPoint | null; history: WBPoint[] };

const WB_BASE = "https://api.worldbank.org/v2";

/**
 * The raw multi-page response can be 5–6 MB which exceeds Next.js's 2 MB fetch
 * cache ceiling. We bypass the framework fetch cache here and instead persist
 * the *parsed and trimmed* result via `unstable_cache`, which is a key/value
 * cache that has no per-entry size limit.
 */
async function fetchAllCountriesUncached(indicator: string): Promise<Map<string, WBSeries>> {
  const startYear = new Date().getUTCFullYear() - 30;
  const endYear = new Date().getUTCFullYear();
  const url = `${WB_BASE}/country/all/indicator/${indicator}?format=json&per_page=20000&date=${startYear}:${endYear}`;
  const out = new Map<string, WBSeries>();
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`WB all/${indicator}: ${res.status}`);
    const json = (await res.json()) as unknown;
    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) return out;
    const rows = json[1] as Array<{ countryiso3code: string; date: string; value: number | null }>;
    for (const r of rows) {
      if (r.value === null || r.value === undefined) continue;
      const year = Number(r.date);
      const value = Number(r.value);
      if (!Number.isFinite(year) || !Number.isFinite(value)) continue;
      let bucket = out.get(r.countryiso3code);
      if (!bucket) {
        bucket = { latest: null, history: [] };
        out.set(r.countryiso3code, bucket);
      }
      bucket.history.push({ year, value });
    }
    for (const bucket of out.values()) {
      bucket.history.sort((a, b) => a.year - b.year);
      bucket.latest = bucket.history.length ? bucket.history[bucket.history.length - 1] : null;
    }
    return out;
  } catch {
    return out;
  }
}

const cachedFetch = unstable_cache(
  async (indicator: string) => {
    const map = await fetchAllCountriesUncached(indicator);
    return Array.from(map.entries()) as Array<[string, WBSeries]>;
  },
  ["wb-all-countries"],
  { revalidate: 60 * 60 * 24, tags: ["wb"] },
);

export async function fetchAllCountries(indicator: string): Promise<Map<string, WBSeries>> {
  const entries = await cachedFetch(indicator);
  return new Map(entries);
}

export async function fetchWBCountryCodes(): Promise<Set<string>> {
  const url = `${WB_BASE}/country?format=json&per_page=400`;
  const out = new Set<string>();
  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 } });
    if (!res.ok) return out;
    const json = (await res.json()) as unknown;
    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) return out;
    const rows = json[1] as Array<{ id: string; region?: { id: string } }>;
    for (const r of rows) {
      if (r.id && r.region && r.region.id !== "NA") out.add(r.id);
    }
    return out;
  } catch {
    return out;
  }
}
