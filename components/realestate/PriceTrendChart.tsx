interface PriceTrendChartProps {
  /** Ordered oldest → newest. */
  points: { label: string; value: number }[];
  className?: string;
}

/**
 * Inline SVG line chart — no charting library, no client JS. The dataset is
 * a handful of points rendered server-side, so pulling in a chart runtime
 * would cost more than the feature is worth.
 */
export default function PriceTrendChart({ points, className = "" }: PriceTrendChartProps) {
  if (points.length < 2) return null;

  const W = 640;
  const H = 200;
  const PAD = { top: 16, right: 12, bottom: 26, left: 46 };

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const coords = points.map((point, i) => ({
    ...point,
    x: PAD.left + (i / (points.length - 1)) * plotW,
    y: PAD.top + plotH - ((point.value - min) / span) * plotH,
  }));

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${PAD.top + plotH} L${coords[0].x.toFixed(1)},${PAD.top + plotH} Z`;

  const gridLines = [0, 0.5, 1].map((t) => PAD.top + plotH * t);
  const last = coords[coords.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full ${className}`}
      role="img"
      aria-label={`Price trend from ${points[0].label} to ${points[points.length - 1].label}`}
    >
      {gridLines.map((y) => (
        <line key={y} x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="currentColor" className="text-line" strokeWidth="1" />
      ))}

      {[max, (max + min) / 2, min].map((value, i) => (
        <text
          key={value}
          x={PAD.left - 8}
          y={gridLines[i] + 4}
          textAnchor="end"
          className="fill-current text-ink-subtle"
          fontSize="10"
        >
          ₹{Math.round(value / 1000)}K
        </text>
      ))}

      <path d={area} className="fill-current text-accent" opacity="0.12" />
      <path d={line} fill="none" className="stroke-current text-navy" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="4.5" className="fill-current text-accent" />

      {coords.map((c, i) =>
        i % Math.ceil(coords.length / 6) === 0 || i === coords.length - 1 ? (
          <text key={c.label} x={c.x} y={H - 6} textAnchor="middle" className="fill-current text-ink-subtle" fontSize="10">
            {c.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}
