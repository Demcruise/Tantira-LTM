import { useState } from "react";
import { Button, HTMLSelect, Icon } from "@blueprintjs/core";
import { LOST_REASONS, WON_REASONS, type Lead, type Outcome } from "../../types";

const OUTCOMES: Outcome[] = ["Won", "Lost", "No response"];

function reasonsFor(outcome: Outcome): readonly string[] {
  if (outcome === "Won") return WON_REASONS;
  if (outcome === "Lost") return LOST_REASONS;
  return ["No response"];
}

interface OutcomeFormProps {
  lead: Lead;
  onLogOutcome: (leadId: string, outcome: Outcome, reason: string) => void;
}

export function OutcomeForm({ lead, onLogOutcome }: OutcomeFormProps) {
  const [pending, setPending] = useState<Outcome>("Won");
  const [reason, setReason] = useState<string>(WON_REASONS[0]);

  if (lead.outcome) {
    return (
      <div className="outcome-form__logged">
        <Icon icon="tick-circle" size={14} intent="success" />
        <span>
          Outcome logged: <strong>{lead.outcome}</strong>
          {lead.outcomeReason && lead.outcomeReason !== lead.outcome && ` — ${lead.outcomeReason}`}
        </span>
      </div>
    );
  }

  function changeOutcome(next: Outcome) {
    setPending(next);
    setReason(reasonsFor(next)[0]);
  }

  return (
    <div className="outcome-form">
      <div className="outcome-form__row">
        <HTMLSelect fill value={pending} onChange={(e) => changeOutcome(e.target.value as Outcome)}>
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </HTMLSelect>
        {pending !== "No response" && (
          <HTMLSelect fill value={reason} onChange={(e) => setReason(e.target.value)}>
            {reasonsFor(pending).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </HTMLSelect>
        )}
      </div>
      <Button intent="primary" text="Log outcome" onClick={() => onLogOutcome(lead.id, pending, pending === "No response" ? "No response" : reason)} />
      <p className="outcome-form__microcopy">Outcome + reason feed the model feedback on the Prioritization Model page and pick the downstream sequence.</p>
    </div>
  );
}
