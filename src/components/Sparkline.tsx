function hash(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

// A compact per-lead activity trend — derived from the lead's real engagement
// count, with small per-bar variation seeded off the lead id so it's stable
// across renders rather than random.
export function activityBars(seedId: string, level: number): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const jitter = hash(seedId + "bar" + i, 40) - 20;
    return Math.max(4, Math.min(100, level * 10 + jitter));
  });
}

export function Sparkline({ values, color = "#2d72d2" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="sparkline">
      {values.map((v, i) => (
        <div key={i} className="sparkline__bar" style={{ height: `${(v / max) * 100}%`, background: color }} />
      ))}
    </div>
  );
}
