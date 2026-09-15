function meterColor(value: number): string {
  if (value >= 80) return "#238551";
  if (value >= 60) return "#c87619";
  return "#5f6b7c";
}

export function ConfidenceMeter({ value, label }: { value: number; label?: string }) {
  return (
    <div className="confidence-meter">
      <div className="confidence-meter__track">
        <div className="confidence-meter__fill" style={{ width: `${value}%`, background: meterColor(value) }} />
      </div>
      <span className="confidence-meter__label">
        {value}% {label}
      </span>
    </div>
  );
}
