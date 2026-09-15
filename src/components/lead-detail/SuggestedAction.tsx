import { Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { Lead } from "../../types";

export type SuggestedActionKey = "onboarding" | "nurture" | "escalate";

interface Suggestion {
  key: SuggestedActionKey;
  icon: IconName;
  label: string;
  detail: string;
  destination: string;
}

function getSuggestion(lead: Lead): Suggestion | null {
  if (!lead.outcome) return null;

  if (lead.outcome === "Won") {
    return {
      key: "onboarding",
      icon: "star",
      label: "Kick off onboarding sequence",
      detail: "Moves this account into onboarding automation.",
      destination: "Tracked in Auto-Processed Log",
    };
  }
  if (lead.outcome === "Lost") {
    return {
      key: "nurture",
      icon: "refresh",
      label: "Add to re-engagement nurture",
      detail: "Schedules a check-in touch in 90 days.",
      destination: "Tracked in Auto-Processed Log",
    };
  }
  return {
    key: "escalate",
    icon: "warning-sign",
    label: "Escalate to manager follow-up",
    detail: "No response after outreach — raises a notification for review.",
    destination: "Sends a notification",
  };
}

interface SuggestedActionProps {
  lead: Lead;
  onAct: (key: SuggestedActionKey) => void;
}

export function SuggestedAction({ lead, onAct }: SuggestedActionProps) {
  const suggestion = getSuggestion(lead);
  if (!suggestion) return null;

  return (
    <div className="suggested-action">
      <p className="suggested-action__label">Suggested next action</p>
      <button type="button" className="suggested-action__card" onClick={() => onAct(suggestion.key)}>
        <span className="suggested-action__icon">
          <Icon icon={suggestion.icon} size={14} />
        </span>
        <div className="suggested-action__text">
          <div className="suggested-action__title">{suggestion.label}</div>
          <div className="suggested-action__detail">{suggestion.detail}</div>
          <div className="suggested-action__destination">{suggestion.destination}</div>
        </div>
        <Icon icon="arrow-right" size={12} className="suggested-action__arrow" />
      </button>
    </div>
  );
}
