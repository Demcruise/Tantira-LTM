import { useMemo, useState } from "react";
import { Card, Checkbox, H5 } from "@blueprintjs/core";
import type { ScoringRule, TierThresholds } from "../../types";
import { runSimulation } from "../../lib/scoringSimulation";
import { PriorityTag } from "../Tags";

interface LiveSimulatorPanelProps {
  rules: ScoringRule[];
  thresholds: TierThresholds;
}

export function LiveSimulatorPanel({ rules, thresholds }: LiveSimulatorPanelProps) {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const activeRules = rules.filter((r) => r.status === "active");
  const result = useMemo(() => runSimulation(appliedIds, rules, thresholds), [appliedIds, rules, thresholds]);

  function toggle(ruleId: string) {
    setAppliedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });
  }

  return (
    <Card elevation={1} className="live-simulator-panel">
      <H5>Live Simulator</H5>
      <p className="live-simulator-panel__hint">Check which conditions a hypothetical lead meets.</p>

      <div className="live-simulator-panel__form">
        {activeRules.map((rule) => (
          <Checkbox key={rule.id} checked={appliedIds.has(rule.id)} onChange={() => toggle(rule.id)}>
            {rule.description}{" "}
            <span className="live-simulator-panel__rule-points" style={{ color: rule.points >= 0 ? "#238551" : "#CD4246" }}>
              ({rule.points >= 0 ? "+" : "−"}
              {Math.abs(rule.points)})
            </span>
          </Checkbox>
        ))}
      </div>

      <div className="live-simulator-panel__result">
        <div className="live-simulator-panel__score-row">
          <span>Total score</span>
          <strong>{result.totalScore} / 100</strong>
        </div>

        {result.breakdown.length > 0 && (
          <div className="live-simulator-panel__breakdown">
            {result.breakdown.map((b) => (
              <div key={b.ruleId} className="live-simulator-panel__breakdown-row">
                <span>{b.description}</span>
                <span style={{ color: b.pointsApplied >= 0 ? "#238551" : "#CD4246" }}>
                  {b.pointsApplied >= 0 ? "+" : "−"}
                  {Math.abs(b.pointsApplied)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="live-simulator-panel__tier-row">
          <span>Resulting tier</span>
          <PriorityTag priority={result.resultingTier} />
        </div>
      </div>
    </Card>
  );
}
