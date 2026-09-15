import { InputGroup } from "@blueprintjs/core";

interface PointsInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function PointsInput({ value, onChange }: PointsInputProps) {
  const isPositive = value >= 0;

  return (
    <div className="points-input" style={{ color: isPositive ? "#238551" : "#CD4246" }}>
      <span className="points-input__sign">{isPositive ? "+" : "−"}</span>
      <InputGroup
        className="points-input__field"
        type="number"
        value={String(Math.abs(value))}
        onChange={(e) => {
          const magnitude = Math.abs(Number(e.target.value) || 0);
          onChange(isPositive ? magnitude : -magnitude);
        }}
      />
      <button
        type="button"
        className="points-input__toggle"
        title={isPositive ? "Make negative" : "Make positive"}
        onClick={() => onChange(-value)}
      >
        ±
      </button>
    </div>
  );
}
