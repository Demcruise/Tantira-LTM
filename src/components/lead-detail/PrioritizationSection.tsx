import { useState } from "react";
import { Icon, Tooltip } from "@blueprintjs/core";
import type { Lead, ScoringRule } from "../../types";
import { PriorityTag } from "../Tags";
import { ConfidenceMeter } from "../ConfidenceMeter";
import { explainScore } from "../../lib/scoreExplanation";
import { tierForScore } from "../../lib/scoringSimulation";
import { DEFAULT_THRESHOLDS } from "../../lib/scoring";

export function PrioritizationSection({ lead, confidence, rules }: { lead: Lead; confidence: number; rules: ScoringRule[] }) {
  const [open, setOpen] = useState(false);
  const explanation = explainScore(lead, rules);
  const computedTier = tierForScore(explanation.computedScore, DEFAULT_THRESHOLDS);
  const matchedRows = explanation.breakdown.filter((b) => b.matched === true);
  const diverges = computedTier !== lead.priority;

  return (
    <div className="prioritization-section">
      <div className="prioritization-section__row">
        <PriorityTag priority={lead.priority} />
        <Tooltip content="Fit + Intent score, weighted by firmographic match and engagement activity.">
          <span className="prioritization-section__score">
            {lead.score}/100 <span className="prioritization-section__info">ⓘ</span>
          </span>
        </Tooltip>
      </div>
      <ConfidenceMeter value={confidence} label="confidence in this tier" />

      <button type="button" className="prioritization-section__why-toggle" onClick={() => setOpen(!open)}>
        <Icon icon={open ? "chevron-up" : "chevron-down"} size={11} />
        Why this score?
      </button>

      {open && (
        <div className="prioritization-section__breakdown">
          {matchedRows.length === 0 ? (
            <p className="prioritization-section__breakdown-empty">No active scoring rule matches this lead's data.</p>
          ) : (
            matchedRows.map((row) => (
              <div key={row.rule.id} className="prioritization-section__breakdown-row">
                <span>{row.rule.description}</span>
                <span className={row.pointsApplied >= 0 ? "prioritization-section__points--pos" : "prioritization-section__points--neg"}>
                  {row.pointsApplied >= 0 ? "+" : "−"}
                  {Math.abs(row.pointsApplied)}
                </span>
              </div>
            ))
          )}

          <div className="prioritization-section__breakdown-total">
            <span>Computed from active rules</span>
            <span>
              {explanation.computedScore}/100 · <PriorityTag priority={computedTier} />
            </span>
          </div>

          {diverges && (
            <p className="prioritization-section__breakdown-note">
              <Icon icon="warning-sign" size={11} /> Diverges from the recorded tier ({lead.priority}) — the model or rules may have
              changed since this lead was scored.
            </p>
          )}

          {explanation.unevaluableCount > 0 && (
            <p className="prioritization-section__breakdown-note prioritization-section__breakdown-note--muted">
              {explanation.unevaluableCount} custom rule{explanation.unevaluableCount === 1 ? "" : "s"} can't be auto-checked — verify in
              the Live Simulator.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
