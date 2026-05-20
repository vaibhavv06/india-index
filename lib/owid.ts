import { unstable_cache } from "next/cache";

export type OwidPoint = { year: number; value: number };
export type OwidSeries = { latest: OwidPoint | null; history: OwidPoint[] };

const OWID_BASE = "https://ourworldindata.org/grapher";

async function fetchOwidUncached(slug: string): Promise<Map<string, OwidSeries>> {
  const out = new Map<string, OwidSeries>();
  try {
    const res = await fetch(`${OWID_BASE}/${slug}.csv`, { cache: "no-store" });
    if (!res.ok) throw new Error(`OWID ${slug}: ${res.status}`);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return out;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      const code = cols[1];
      if (!code || code === "OWID_WRL") continue;
      const year = Number(cols[2]);
      const value = Number(cols[3]);
      if (!Number.isFinite(year) || !Number.isFinite(value)) continue;
      let bucket = out.get(code);
      if (!bucket) {
        bucket = { latest: null, history: [] };
        out.set(code, bucket);
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
  async (slug: string) => {
    const map = await fetchOwidUncached(slug);
    return Array.from(map.entries()) as Array<[string, OwidSeries]>;
  },
  ["owid-grapher"],
  { revalidate: 60 * 60 * 24, tags: ["owid"] },
);

export async function fetchOwidAll(slug: string): Promise<Map<string, OwidSeries>> {
  const entries = await cachedFetch(slug);
  return new Map(entries);
}
