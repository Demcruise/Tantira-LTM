import type { TierDistribution } from "../../lib/scoringSimulation";

const TIER_COLOR = { hot: "#CD4246", warm: "#C87619", cold: "#5F6B7C" };

export function ThresholdPreviewChart({ distribution }: { distribution: TierDistribution }) {
  return (
    <div className="threshold-preview-chart">
      <div className="threshold-preview-chart__bar">
        <div className="threshold-preview-chart__segment" style={{ width: `${distribution.hotPct}%`, background: TIER_COLOR.hot }} />
        <div className="threshold-preview-chart__segment" style={{ width: `${distribution.warmPct}%`, background: TIER_COLOR.warm }} />
        <div className="threshold-preview-chart__segment" style={{ width: `${distribution.coldPct}%`, background: TIER_COLOR.cold }} />
      </div>
      <div className="threshold-preview-chart__legend">
        <span style={{ color: TIER_COLOR.hot }}>● Hot {distribution.hotPct}% ({distribution.hot})</span>
        <span style={{ color: TIER_COLOR.warm }}>● Warm {distribution.warmPct}% ({distribution.warm})</span>
        <span style={{ color: TIER_COLOR.cold }}>● Cold {distribution.coldPct}% ({distribution.cold})</span>
      </div>
    </div>
  );
}
