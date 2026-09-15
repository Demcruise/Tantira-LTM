import { Button, ButtonGroup, Tooltip } from "@blueprintjs/core";
import type { Lead, LeadActionType } from "../../types";
import { LEAD_ACTION_META, isSnoozed } from "../../lib/leadActions";

const ORDER: LeadActionType[] = ["contact", "qualify", "disqualify", "snooze", "nurture", "escalate"];

function disabledReason(lead: Lead, type: LeadActionType): string | null {
  if (lead.status === "Lost") return "Lead is closed.";
  switch (type) {
    case "contact":
      return lead.status === "Contacted" || lead.status === "Qualified" ? "Already contacted." : null;
    case "qualify":
      return lead.status === "Qualified" ? "Already qualified." : null;
    case "snooze":
      return isSnoozed(lead.snoozedUntil) ? "Already snoozed." : null;
    case "nurture":
      return lead.inNurture ? "Already in a nurture sequence." : null;
    default:
      return null;
  }
}

export function LeadActionsBar({ lead, onAction }: { lead: Lead; onAction: (type: LeadActionType) => void }) {
  return (
    <ButtonGroup className="lead-actions">
      {ORDER.map((type) => {
        const meta = LEAD_ACTION_META[type];
        const blocked = disabledReason(lead, type);
        return (
          <Tooltip key={type} content={blocked ?? meta.label} placement="bottom">
            <Button small minimal icon={meta.icon} text={meta.label} intent={meta.intent} disabled={blocked !== null} onClick={() => onAction(type)} />
          </Tooltip>
        );
      })}
    </ButtonGroup>
  );
}
