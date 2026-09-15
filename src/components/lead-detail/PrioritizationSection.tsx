import { Tooltip } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { PriorityTag } from "../Tags";

export function PrioritizationSection({ lead, confidence }: { lead: Lead; confidence: number }) {
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
      <div className="prioritization-section__confidence">{confidence}% confidence in this tier</div>
    </div>
  );
}
