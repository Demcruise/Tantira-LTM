import { useState } from "react";
import { Button, ButtonGroup, Tooltip } from "@blueprintjs/core";
import type { ActivityChannel, Lead, LeadActionType } from "../../types";
import { LEAD_ACTION_META, isSnoozed } from "../../lib/leadActions";
import { LogActivityDialog } from "./LogActivityDialog";

const ORDER: LeadActionType[] = ["contact", "qualify", "disqualify", "snooze", "nurture", "escalate"];

function disabledReason(lead: Lead, type: LeadActionType): string | null {
  if (lead.status === "Lost") return "Lead is closed.";
  switch (type) {
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

interface LeadActionsBarProps {
  lead: Lead;
  onAction: (type: LeadActionType) => void;
  onLogActivity: (payload: { channel: ActivityChannel; note: string; followUpDueAt: string | null }) => void;
}

export function LeadActionsBar({ lead, onAction, onLogActivity }: LeadActionsBarProps) {
  const [logOpen, setLogOpen] = useState(false);

  return (
    <>
      <ButtonGroup className="lead-actions">
        {ORDER.map((type) => {
          const meta = LEAD_ACTION_META[type];
          const blocked = disabledReason(lead, type);
          return (
            <Tooltip key={type} content={blocked ?? meta.label} placement="bottom">
              <Button
                small
                minimal
                icon={meta.icon}
                text={meta.label}
                intent={meta.intent}
                disabled={blocked !== null}
                onClick={() => (type === "contact" ? setLogOpen(true) : onAction(type))}
              />
            </Tooltip>
          );
        })}
      </ButtonGroup>

      <LogActivityDialog isOpen={logOpen} onClose={() => setLogOpen(false)} onSubmit={onLogActivity} />
    </>
  );
}
