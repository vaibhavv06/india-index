type Point = { year: number; value: number };

type Props = {
  points: Point[];
  unit?: string;
  invert?: boolean;
  height?: number;
};

export function HistoryChart({ points, unit, invert, height = 280 }: Props) {
  if (!points || points.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-sm text-zinc-500">
        Not enough data points to chart.
      </div>
    );
  }
  const sorted = [...points].sort((a, b) => a.year - b.year);
  const xs = sorted.map((p) => p.year);
  const ys = sorted.map((p) => p.value);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const yPad = (maxY - minY) * 0.1 || 1;
  const yMin = minY - yPad;
  const yMax = maxY + yPad;
  const xRange = maxX - minX || 1;
  const yRange = yMax - yMin || 1;

  const W = 800;
  const H = height;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const toX = (x: number) => padL + ((x - minX) / xRange) * innerW;
  const toY = (y: number) => padT + (1 - (y - yMin) / yRange) * innerH;

  const path = sorted.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.year).toFixed(2)} ${toY(p.value).toFixed(2)}`).join(" ");
  const areaPath = `${path} L ${toX(maxX).toFixed(2)} ${(padT + innerH).toFixed(2)} L ${toX(minX).toFixed(2)} ${(padT + innerH).toFixed(2)} Z`;

  const first = sorted[0].value;
  const last = sorted[sorted.length - 1].value;
  const rising = last >= first;
  const goodTrend = invert ? !rising : rising;
  const stroke = goodTrend ? "#22c55e" : "#ef4444";

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (i * yRange) / yTicks);

  const formatY = (v: number) => {
    if (Math.abs(v) >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (Math.abs(v) >= 10) return v.toFixed(1);
    return v.toFixed(2);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Time series chart">
        <defs>
          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {tickValues.map((t, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={W - padR}
              y1={toY(t)}
              y2={toY(t)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text x={padL - 8} y={toY(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#71717a">
              {formatY(t)}
              {unit === "%" ? "%" : ""}
            </text>
          </g>
        ))}

        {sorted.map((p, i) => (
          <text
            key={i}
            x={toX(p.year)}
            y={H - padB + 18}
            textAnchor="middle"
            fontSize="11"
            fill="#71717a"
          >
            {p.year}
          </text>
        ))}

        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {sorted.map((p, i) => (
          <g key={i}>
            <circle cx={toX(p.year)} cy={toY(p.value)} r={3.5} fill={stroke} />
            <title>{`${p.year}: ${formatY(p.value)}${unit ?? ""}`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}
