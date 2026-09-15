import { H5, RangeSlider } from "@blueprintjs/core";
import type { TierThresholds } from "../../types";
import { computeDistribution } from "../../lib/scoringSimulation";
import { ThresholdPreviewChart } from "./ThresholdPreviewChart";

interface TierThresholdEditorProps {
  thresholds: TierThresholds;
  leadScores: number[];
  onChange: (thresholds: TierThresholds) => void;
  onCommit: (thresholds: TierThresholds) => void;
}

export function TierThresholdEditor({ thresholds, leadScores, onChange, onCommit }: TierThresholdEditorProps) {
  const distribution = computeDistribution(leadScores, thresholds);

  return (
    <div className="tier-threshold-editor">
      <H5>Tier Thresholds</H5>
      <p className="tier-threshold-editor__hint">
        Cold: 0–{thresholds.warmMin - 1} · Warm: {thresholds.warmMin}–{thresholds.hotMin - 1} · Hot: {thresholds.hotMin}–100
      </p>

      <div className="tier-threshold-editor__slider">
        <RangeSlider
          min={0}
          max={100}
          stepSize={1}
          labelStepSize={25}
          value={[thresholds.warmMin, thresholds.hotMin]}
          onChange={([warmMin, hotMin]) => onChange({ warmMin, hotMin: Math.max(hotMin, warmMin + 1) })}
          onRelease={([warmMin, hotMin]) => onCommit({ warmMin, hotMin: Math.max(hotMin, warmMin + 1) })}
        />
      </div>

      <ThresholdPreviewChart distribution={distribution} />
    </div>
  );
}
