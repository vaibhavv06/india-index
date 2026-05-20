type Point = { year: number; value: number };

type Props = {
  points: Point[];
  width?: number;
  height?: number;
  invert?: boolean; // higher value = worse
  className?: string;
};

export function Sparkline({ points, width = 120, height = 36, invert = false, className }: Props) {
  if (!points || points.length < 2) {
    return <div className={className} style={{ width, height }} />;
  }

  const xs = points.map((p) => p.year);
  const ys = points.map((p) => p.value);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;
  const pad = 3;

  const toX = (x: number) => pad + ((x - minX) / xRange) * (width - 2 * pad);
  const toY = (y: number) => height - pad - ((y - minY) / yRange) * (height - 2 * pad);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.year).toFixed(2)} ${toY(p.value).toFixed(2)}`).join(" ");

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const rising = last >= first;
  const goodTrend = invert ? !rising : rising;
  const stroke = goodTrend ? "#22c55e" : "#ef4444";

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={toX(points[points.length - 1].year)} cy={toY(last)} r={2.2} fill={stroke} />
    </svg>
  );
}
