import { CATEGORIES, INDICES, indicesByCategory } from "@/lib/indices";
import { fetchIndexData } from "@/lib/data";
import { IndexCard } from "@/components/IndexCard";

export const revalidate = 86400;

type Bundle = {
  spec: (typeof INDICES)[number];
  data: Awaited<ReturnType<typeof fetchIndexData>>;
};

export default async function Home() {
  const bundles: Bundle[] = await Promise.all(
    INDICES.map(async (spec) => ({ spec, data: await fetchIndexData(spec) })),
  );

  const concerning = bundles.filter((b) => {
    const india = b.data.peers.find((p) => p.code === "IND");
    if (!india || india.value === null) return false;
    const others = b.data.peers.filter((p) => p.code !== "IND" && p.value !== null);
    if (others.length < 2) return false;
    if (b.spec.invert) return others.every((o) => (o.value as number) < (india.value as number));
    return others.every((o) => (o.value as number) > (india.value as number));
  });

  const liveCount = bundles.filter((b) => b.data.india.latest !== null).length;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <Hero totalIndices={INDICES.length} liveCount={liveCount} concerning={concerning.slice(0, 4)} />

      <main className="mx-auto max-w-7xl px-6 pb-24 sm:px-8">
        {concerning.length > 0 && (
          <section id="concerning" className="mt-16 scroll-mt-20">
            <header className="mb-6 flex items-baseline justify-between border-b border-rose-500/20 pb-3">
              <div>
                <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
                  <span aria-hidden className="text-2xl">⚠️</span>
                  Where India is falling behind
                </h2>
                <p className="mt-1 text-sm text-rose-200/80">
                  Indices where India ranks worst among its South Asian neighbours.
                </p>
              </div>
              <span className="text-xs text-zinc-500">{concerning.length} flagged</span>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {concerning.map((b) => (
                <IndexCard
                  key={b.spec.slug}
                  spec={b.spec}
                  peers={b.data.peers}
                  history={b.data.india.history}
                  worldRank={b.data.worldRank}
                  worldTotal={b.data.worldTotal}
                />
              ))}
            </div>
          </section>
        )}

        {CATEGORIES.map((cat) => {
          const items = indicesByCategory(cat.id);
          if (!items.length) return null;
          return (
            <section key={cat.id} id={cat.id} className="mt-16 scroll-mt-20">
              <header className="mb-6 flex items-baseline justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
                    <span aria-hidden className="text-2xl">{cat.emoji}</span>
                    {cat.label}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">{cat.blurb}</p>
                </div>
                <span className="text-xs text-zinc-500">{items.length} indices</span>
              </header>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((spec) => {
                  const b = bundles.find((x) => x.spec.slug === spec.slug)!;
                  return (
                    <IndexCard
                      key={spec.slug}
                      spec={b.spec}
                      peers={b.data.peers}
                      history={b.data.india.history}
                      worldRank={b.data.worldRank}
                      worldTotal={b.data.worldTotal}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}

function Hero({
  totalIndices,
  liveCount,
  concerning,
}: {
  totalIndices: number;
  liveCount: number;
  concerning: Bundle[];
}) {
  const headlines = concerning
    .slice(0, 3)
    .map((b) => b.spec.name)
    .filter(Boolean);

  return (
    <header className="relative overflow-hidden border-b border-white/10">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 30%, rgba(255,153,51,0.18), transparent 60%), radial-gradient(50% 60% at 70% 60%, rgba(19,136,8,0.18), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-20 sm:px-8 sm:pt-28">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          100% live data · Refreshed daily
        </div>
        <h1 className="mt-4 max-w-4xl text-balance text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
          India by the numbers.
          <span className="block text-zinc-400">Every index. Every neighbour. One page.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          A clear-eyed look at where India actually stands across {totalIndices} global indices —
          benchmarked against its South Asian neighbours. Some of the results may surprise you.
        </p>
        {headlines.length > 0 && (
          <a
            href="#concerning"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200 ring-1 ring-rose-500/30 transition hover:bg-rose-500/15"
          >
            <span aria-hidden>⚠️</span>
            India ranks last in South Asia on{" "}
            <span className="font-semibold">{headlines.join(", ")}</span>
            <span className="opacity-70">→</span>
          </a>
        )}
        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <span className="mr-1.5">{c.emoji}</span>
              {c.label}
            </a>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-500">
          <Stat label="Indices tracked" value={String(totalIndices)} />
          <Stat label="Live series fetched" value={String(liveCount)} />
          <Stat label="Categories" value={String(CATEGORIES.length)} />
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-zinc-100">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-zinc-500 sm:px-8">
        <p>
          All data fetched live from the World Bank Open Data API and Our World in Data, with a
          24-hour cache that refreshes via a daily scheduled job. Click any card for full
          methodology, history, and a per-country comparison.
        </p>
        <p className="mt-2">
          This site is a non-partisan research project. Sources are linked on every card.
        </p>
      </div>
    </footer>
  );
}
