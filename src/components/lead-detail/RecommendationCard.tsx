import { useState } from "react";
import { Button, HTMLSelect, Icon, Radio, RadioGroup, Tag } from "@blueprintjs/core";
import type { Lead, OverrideReason } from "../../types";
import type { LeadRecommendation } from "../../lib/recommendation";
import { PriorityTag } from "../Tags";

const OVERRIDE_REASONS: OverrideReason[] = ["Existing relationship", "Territory ownership", "Rep specialization", "Capacity", "Other"];

interface RecommendationCardProps {
  lead: Lead;
  recommendation: LeadRecommendation;
  assigneeOptions: string[];
  onAccept: (leadId: string, owner: string) => void;
  onOverride: (leadId: string, owner: string, reason: OverrideReason) => void;
}

export function RecommendationCard({ lead, recommendation, assigneeOptions, onAccept, onOverride }: RecommendationCardProps) {
  const [overriding, setOverriding] = useState(false);
  const [owner, setOwner] = useState(assigneeOptions.find((a) => a !== recommendation.owner) ?? assigneeOptions[0] ?? "");
  const [reason, setReason] = useState<OverrideReason>("Existing relationship");

  return (
    <div className="recommendation">
      <div className="recommendation__header">
        <Icon icon="predictive-analysis" size={14} />
        <span>Tantira recommends</span>
        <span className="recommendation__confidence">{recommendation.confidence}% confidence</span>
      </div>

      <div className="recommendation__grid">
        <div className="recommendation__cell">
          <span className="recommendation__cell-label">Priority</span>
          <span className="recommendation__cell-value">
            <PriorityTag priority={recommendation.priority} /> <span className="recommendation__score">{lead.score}/100</span>
          </span>
        </div>
        <div className="recommendation__cell">
          <span className="recommendation__cell-label">Owner</span>
          <span className="recommendation__cell-value">{recommendation.owner ?? "No eligible rep"}</span>
          <span className="recommendation__cell-basis">{recommendation.ownerBasis}</span>
        </div>
      </div>

      <div className="recommendation__reasons">
        {recommendation.reasons.map((r) => (
          <Tag key={r} minimal round>
            {r}
          </Tag>
        ))}
      </div>

      <div className="recommendation__eligibility">
        {recommendation.eligibility.map((e) => (
          <div key={e.rep} className={`recommendation__rep${e.eligible ? "" : " recommendation__rep--ineligible"}`}>
            <Icon icon={e.eligible ? "tick-circle" : "cross-circle"} size={12} />
            <span className="recommendation__rep-name">{e.rep}</span>
            <span className="recommendation__rep-checks">{e.checks.map((c) => c.label).join(" · ")}</span>
          </div>
        ))}
      </div>

      {!overriding ? (
        <div className="recommendation__actions">
          <Button intent="primary" icon="tick" text={recommendation.owner ? `Accept — assign to ${recommendation.owner}` : "Accept"} disabled={!recommendation.owner} onClick={() => recommendation.owner && onAccept(lead.id, recommendation.owner)} />
          <Button icon="swap-horizontal" text="Override" onClick={() => setOverriding(true)} />
        </div>
      ) : (
        <div className="recommendation__override">
          <HTMLSelect fill value={owner} onChange={(e) => setOwner(e.target.value)}>
            {assigneeOptions.map((a) => (
              <option key={a} value={a}>
                {a}
                {a === recommendation.owner ? " (recommended)" : ""}
              </option>
            ))}
          </HTMLSelect>
          <RadioGroup label="Why override?" selectedValue={reason} onChange={(e) => setReason(e.currentTarget.value as OverrideReason)}>
            {OVERRIDE_REASONS.map((r) => (
              <Radio key={r} label={r} value={r} />
            ))}
          </RadioGroup>
          <div className="recommendation__actions">
            <Button intent="primary" icon="tick" text={`Assign to ${owner}`} disabled={!owner} onClick={() => onOverride(lead.id, owner, reason)} />
            <Button minimal text="Cancel" onClick={() => setOverriding(false)} />
          </div>
          <p className="recommendation__hint">Overrides are recorded with the reason and feed back into routing tuning.</p>
        </div>
      )}
    </div>
  );
}
