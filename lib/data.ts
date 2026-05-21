import type { IndexSpec } from "./indices";
import { fetchAllCountries, fetchWBCountryCodes } from "./worldbank";
import { fetchOwidAll } from "./owid";
import { fetchRsfAllYears } from "./rsf";

export type Point = { year: number; value: number };
export type SeriesData = { latest: Point | null; history: Point[] };

export const PEERS: { code: string; name: string }[] = [
  { code: "IND", name: "India" },
  { code: "BGD", name: "Bangladesh" },
  { code: "PAK", name: "Pakistan" },
  { code: "NPL", name: "Nepal" },
  { code: "LKA", name: "Sri Lanka" },
  { code: "BTN", name: "Bhutan" },
];

export type PeerValue = { code: string; name: string; value: number | null; year: number | null };

export type IndexData = {
  india: SeriesData;
  peers: PeerValue[];
  worldRank: number | null;
  worldTotal: number | null;
};

type CountrySeries = { latest: Point | null; history: Point[] };

export async function fetchIndexData(spec: IndexSpec): Promise<IndexData> {
  let all: Map<string, CountrySeries>;
  let realCountries: Set<string> | null = null;

  if (spec.fetcher.kind === "wb") {
    [all, realCountries] = await Promise.all([
      fetchAllCountries(spec.fetcher.indicator),
      fetchWBCountryCodes(),
    ]);
  } else if (spec.fetcher.kind === "owid") {
    all = await fetchOwidAll(spec.fetcher.slug);
  } else {
    all = await fetchRsfAllYears();
  }

  const indiaSeries: SeriesData = (() => {
    const s = all.get("IND");
    return s ? { latest: s.latest, history: s.history } : { latest: null, history: [] };
  })();

  const peers: PeerValue[] = PEERS.map((p) => {
    const s = all.get(p.code);
    return {
      code: p.code,
      name: p.name,
      value: s?.latest?.value ?? null,
      year: s?.latest?.year ?? null,
    };
  });

  const worldRanking = computeWorldRank(all, realCountries, indiaSeries.latest, spec.invert);

  return {
    india: indiaSeries,
    peers,
    worldRank: worldRanking?.rank ?? null,
    worldTotal: worldRanking?.total ?? null,
  };
}

function computeWorldRank(
  all: Map<string, CountrySeries>,
  realCountries: Set<string> | null,
  indiaLatest: Point | null,
  invert?: boolean,
): { rank: number; total: number } | null {
  if (!indiaLatest) return null;
  const targetYear = indiaLatest.year;

  const candidates: Array<{ code: string; value: number }> = [];
  for (const [code, series] of all.entries()) {
    if (realCountries && !realCountries.has(code)) continue;
    if (!series.latest) continue;
    if (Math.abs(series.latest.year - targetYear) > 2) continue;
    candidates.push({ code, value: series.latest.value });
  }

  if (candidates.length < 5) return null;
  candidates.sort((a, b) => (invert ? a.value - b.value : b.value - a.value));
  const rank = candidates.findIndex((c) => c.code === "IND") + 1;
  if (rank === 0) return null;
  return { rank, total: candidates.length };
}
