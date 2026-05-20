import Link from "next/link";
import type { IndexSpec } from "@/lib/indices";
import type { PeerValue } from "@/lib/data";
import { Sparkline } from "./Sparkline";

type Props = {
  spec: IndexSpec;
  peers: PeerValue[];
  history: { year: number; value: number }[];
  worldRank: number | null;
  worldTotal: number | null;
};

function formatValue(v: number | null, unit?: string): string {
  if (v === null || v === undefined) return "—";
  let formatted: string;
  if (Math.abs(v) >= 1000) formatted = v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  else if (Math.abs(v) >= 10) formatted = v.toLocaleString(undefined, { maximumFractionDigits: 1 });
  else formatted = v.toLocaleString(undefined, { maximumFractionDigits: 3 });
  if (unit === "%") return `${formatted}%`;
  if (unit === "USD") return `$${formatted}`;
  if (unit) return `${formatted} ${unit}`;
  return formatted;
}

function indiaRankAmongPeers(peers: PeerValue[], invert?: boolean): { rank: number; total: number } | null {
  const valid = peers.filter((p) => p.value !== null);
  if (valid.length < 2) return null;
  const sorted = [...valid].sort((a, b) => {
    const av = a.value as number;
    const bv = b.value as number;
    return invert ? av - bv : bv - av;
  });
  const rank = sorted.findIndex((p) => p.code === "IND") + 1;
  return rank > 0 ? { rank, total: valid.length } : null;
}

function worldRankTone(rank: number | null, total: number | null): "good" | "warn" | "bad" | "neutral" {
  if (!rank || !total) return "neutral";
  const pct = rank / total;
  if (pct <= 0.33) return "good";
  if (pct <= 0.66) return "warn";
  return "bad";
}

export function IndexCard({ spec, peers, history, worldRank, worldTotal }: Props) {
  const india = peers.find((p) => p.code === "IND");
  const indiaValue = india?.value ?? null;
  const indiaYear = india?.year ?? null;

  const peerRanking = indiaRankAmongPeers(peers, spec.invert);
  const isWorstInSouthAsia = peerRanking ? peerRanking.rank === peerRanking.total : false;

  const beatBy = (() => {
    if (!india || india.value === null) return null;
    const others = peers.filter((p) => p.code !== "IND" && p.value !== null);
    if (!others.length) return null;
    const winners = spec.invert
      ? others.filter((p) => (p.value as number) < (india.value as number))
      : others.filter((p) => (p.value as number) > (india.value as number));
    return winners.length ? winners.map((w) => w.name) : null;
  })();

  const wTone = worldRankTone(worldRank, worldTotal);
  const worldChipClass = {
    good: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
    warn: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    bad: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
    neutral: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
  }[wTone];

  const accentBorder = isWorstInSouthAsia ? "border-rose-500/40" : "border-white/10";
  const accentGlow = isWorstInSouthAsia ? "shadow-[0_0_0_1px_rgba(244,63,94,0.15)]" : "";

  return (
    <Link
      href={`/index/${spec.slug}`}
      className={`group relative flex flex-col gap-3 rounded-2xl border ${accentBorder} ${accentGlow} bg-white/[0.02] p-5 transition hover:bg-white/[0.04]`}
    >
      {isWorstInSouthAsia && (
        <div className="absolute -top-2 left-4 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow">
          ⚠ Worst in South Asia
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{spec.emoji}</span>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-100">{spec.name}</h3>
        </div>
        {worldRank && worldTotal ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${worldChipClass}`}
            title={`World rank: ${worldRank} of ${worldTotal}`}
          >
            #{worldRank}/{worldTotal} world
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tabular-nums text-zinc-50">
            {formatValue(indiaValue, spec.unit)}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-zinc-500">
            {indiaYear ? `as of ${indiaYear}` : "no data"}
          </div>
        </div>
        <Sparkline points={history} invert={spec.invert} />
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">{spec.description}</p>

      {beatBy && beatBy.length > 0 && (
        <div className="rounded-lg bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200 ring-1 ring-rose-500/20">
          ⚠ Behind: {beatBy.slice(0, 3).join(", ")}
          {beatBy.length > 3 && ` +${beatBy.length - 3}`}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span>Source: {spec.source.name}</span>
        <span className="opacity-0 transition group-hover:opacity-100">Explore →</span>
      </div>
    </Link>
  );
}
