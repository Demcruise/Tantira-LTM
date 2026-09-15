import type { IconName } from "@blueprintjs/icons";
import type { LeadActionType } from "../types";

export const LEAD_ACTION_META: Record<LeadActionType, { label: string; icon: IconName; pastLabel: string; intent?: "primary" | "danger" | "warning" }> = {
  contact: { label: "Contact", icon: "phone", pastLabel: "Contacted", intent: "primary" },
  qualify: { label: "Qualify", icon: "endorsed", pastLabel: "Qualified" },
  disqualify: { label: "Disqualify", icon: "disable", pastLabel: "Disqualified", intent: "danger" },
  snooze: { label: "Snooze 1d", icon: "moon", pastLabel: "Snoozed for 1 day" },
  nurture: { label: "Nurture", icon: "send-to", pastLabel: "Moved to nurture" },
  escalate: { label: "Escalate", icon: "warning-sign", pastLabel: "Escalated to manager", intent: "warning" },
};

export function isSnoozed(snoozedUntil: string | null, now = Date.now()): boolean {
  return snoozedUntil !== null && new Date(snoozedUntil).getTime() > now;
}
