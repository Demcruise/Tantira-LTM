import { Callout } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { PriorityTag } from "../Tags";
import { predictionDiverged, predictionOutcomeInsight } from "../../lib/predictionInsight";

export function PredictionOutcomeCard({ lead }: { lead: Lead }) {
  if (!lead.outcome) return null;
  const insight = predictionOutcomeInsight(lead);
  const diverged = predictionDiverged(lead);

  return (
    <div className="prediction-outcome-card">
      <div className="prediction-outcome-card__title">Prediction vs Outcome</div>
      <div className="prediction-outcome-card__row">
        <div className="prediction-outcome-card__cell">
          <span className="prediction-outcome-card__label">Predicted</span>
          <span className="prediction-outcome-card__value">
            <PriorityTag priority={lead.priority} /> {lead.score}/100
          </span>
        </div>
        <div className="prediction-outcome-card__cell">
          <span className="prediction-outcome-card__label">Actual</span>
          <span className="prediction-outcome-card__value">{lead.outcome}</span>
        </div>
      </div>
      {lead.outcomeReason && <p className="prediction-outcome-card__reason">Reason: {lead.outcomeReason}</p>}
      {insight && (
        <Callout intent={diverged ? "warning" : "success"} icon={diverged ? "warning-sign" : "tick"} className="prediction-outcome-card__insight">
          {insight}
        </Callout>
      )}
    </div>
  );
}
