import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, INDICES, findIndex, indicesByCategory } from "@/lib/indices";
import { fetchIndexData } from "@/lib/data";
import { HistoryChart } from "@/components/HistoryChart";

export const revalidate = 86400;

export function generateStaticParams() {
  return INDICES.map((i) => ({ slug: i.slug }));
}

type Params = { slug: string };

export default async function IndexDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const spec = findIndex(slug);
  if (!spec) notFound();

  const data = await fetchIndexData(spec);
  const cat = CATEGORIES.find((c) => c.id === spec.category)!;
  const siblings = indicesByCategory(spec.category).filter((i) => i.slug !== spec.slug);

  const validPeers = data.peers.filter((p) => p.value !== null);
  const sortedPeers = [...validPeers].sort((a, b) => {
    const av = a.value as number;
    const bv = b.value as number;
    return spec.invert ? av - bv : bv - av;
  });
  const indiaPeerRank = sortedPeers.findIndex((p) => p.code === "IND") + 1;
  const isWorstInSouthAsia = indiaPeerRank > 0 && indiaPeerRank === sortedPeers.length;

  const worldPct = data.worldRank && data.worldTotal ? data.worldRank / data.worldTotal : null;
  const worldTone = worldPct === null ? "neutral" : worldPct <= 0.33 ? "good" : worldPct <= 0.66 ? "warn" : "bad";
  const worldToneLabel = {
    good: "Top tier globally",
    warn: "Mid-tier globally",
    bad: "Bottom tier globally",
    neutral: "—",
  }[worldTone];
  const worldToneClass = {
    good: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
    warn: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    bad: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
    neutral: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
  }[worldTone];

  const formatHero = (v: number | null) => {
    if (v === null || v === undefined) return "—";
    if (Math.abs(v) >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (Math.abs(v) >= 10) return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-6 sm:px-8">
          <Link href="/" className="text-sm text-zinc-400 transition hover:text-zinc-100">
            ← All indices
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
          <Link href={`/#${cat.id}`} className="hover:text-zinc-300">
            {cat.emoji} {cat.label}
          </Link>
        </div>
        <h1 className="mt-3 flex items-center gap-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          <span aria-hidden>{spec.emoji}</span>
          {spec.name}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">{spec.description}</p>

        {isWorstInSouthAsia && (
          <div className="mt-6 rounded-2xl bg-rose-500/10 p-5 text-rose-100 ring-1 ring-rose-500/30">
            <div className="flex items-start gap-3">
              <span aria-hidden className="text-2xl">⚠️</span>
              <div>
                <div className="text-base font-semibold">India ranks last among South Asian peers.</div>
                {spec.concerningWhen?.copy && (
                  <p className="mt-1 text-sm text-rose-200/90">{spec.concerningWhen.copy}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card label="Latest value">
            <div className="text-3xl font-semibold tabular-nums text-zinc-50">
              {formatHero(data.india.latest?.value ?? null)}
              {spec.unit === "%" && <span className="text-base font-normal text-zinc-400">%</span>}
              {spec.unit === "USD" && <span className="ml-2 text-base font-normal text-zinc-400">USD</span>}
              {spec.unit && spec.unit !== "%" && spec.unit !== "USD" && (
                <span className="ml-2 text-base font-normal text-zinc-400">{spec.unit}</span>
              )}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {data.india.latest ? `As of ${data.india.latest.year}` : "No data"}
            </div>
          </Card>
          <Card label="World rank">
            {data.worldRank && data.worldTotal ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tabular-nums text-zinc-50">#{data.worldRank}</span>
                  <span className="text-sm text-zinc-500">of {data.worldTotal}</span>
                </div>
                <div className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] ring-1 ${worldToneClass}`}>
                  {worldToneLabel}
                </div>
              </>
            ) : (
              <span className="text-zinc-500">—</span>
            )}
          </Card>
          <Card label="Trend">
            <Trend points={data.india.history} invert={spec.invert} />
            <div className="mt-1 text-xs text-zinc-500">over {data.india.history.length} years</div>
          </Card>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">India over time</h2>
          <HistoryChart points={data.india.history} unit={spec.unit} invert={spec.invert} />
        </section>

        {sortedPeers.length > 1 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Compared with neighbours</h2>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Country</th>
                    <th className="px-4 py-3 font-medium">Latest</th>
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium" aria-label="Bar" />
                  </tr>
                </thead>
                <tbody>
                  {sortedPeers.map((p, idx) => {
                    const isIndia = p.code === "IND";
                    const max = Math.max(...sortedPeers.map((x) => Math.abs(x.value as number)));
                    const pct = max > 0 ? (Math.abs(p.value as number) / max) * 100 : 0;
                    return (
                      <tr
                        key={p.code}
                        className={`border-t border-white/5 ${isIndia ? "bg-rose-500/5" : ""}`}
                      >
                        <td className="px-4 py-2 tabular-nums text-zinc-500">{idx + 1}</td>
                        <td className={`px-4 py-2 ${isIndia ? "font-semibold text-rose-200" : "text-zinc-200"}`}>
                          {p.name}
                          {isIndia && <span className="ml-2 text-xs">(India)</span>}
                        </td>
                        <td className="px-4 py-2 tabular-nums text-zinc-100">
                          {formatHero(p.value)}
                          {spec.unit ? ` ${spec.unit === "USD" ? "USD" : spec.unit}` : ""}
                        </td>
                        <td className="px-4 py-2 tabular-nums text-zinc-500">{p.year ?? "—"}</td>
                        <td className="w-[40%] px-4 py-2">
                          <div className="h-2 overflow-hidden rounded-full bg-white/5">
                            <div
                              className={`h-full ${isIndia ? "bg-rose-400" : "bg-zinc-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Sorted from best to worst on this metric.{" "}
              {spec.invert ? "Lower is better." : "Higher is better."}
            </p>
          </section>
        )}

        {data.india.history.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">India: full data</h2>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.india.history].reverse().slice(0, 30).map((p) => (
                    <tr key={p.year} className="border-t border-white/5">
                      <td className="px-4 py-2 tabular-nums text-zinc-300">{p.year}</td>
                      <td className="px-4 py-2 tabular-nums text-zinc-100">
                        {formatHero(p.value)}
                        {spec.unit ? ` ${spec.unit}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-zinc-400">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500">Source</div>
          <a
            href={spec.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-zinc-100 underline-offset-4 hover:underline"
          >
            {spec.source.name} ↗
          </a>
          <p className="mt-2 text-xs text-zinc-500">
            Fetched live, cached for 24 hours. Daily refresh via scheduled job.
          </p>
        </section>

        {siblings.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">More in {cat.label}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/index/${s.slug}`}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <span aria-hidden>{s.emoji}</span>
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{s.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Trend({ points, invert }: { points: { year: number; value: number }[]; invert?: boolean }) {
  if (points.length < 2) return <span className="text-zinc-500">—</span>;
  const first = points[0].value;
  const last = points[points.length - 1].value;
  const delta = last - first;
  const pct = first !== 0 ? (delta / first) * 100 : 0;
  const sign = delta > 0 ? "+" : "";
  const direction = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  const goodTrend = invert ? delta < 0 : delta > 0;
  const color = delta === 0 ? "text-zinc-300" : goodTrend ? "text-emerald-400" : "text-rose-400";
  return (
    <span className={`text-xl font-semibold ${color}`}>
      {direction} {sign}
      {pct.toFixed(1)}%
    </span>
  );
}
