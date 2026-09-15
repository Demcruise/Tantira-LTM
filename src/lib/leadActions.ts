import type { IconName } from "@blueprintjs/icons";
import type { ActivityChannel, LeadActionType } from "../types";

export const LEAD_ACTION_META: Record<LeadActionType, { label: string; icon: IconName; pastLabel: string; intent?: "primary" | "danger" | "warning" }> = {
  contact: { label: "Contact", icon: "phone", pastLabel: "Contacted", intent: "primary" },
  qualify: { label: "Qualify", icon: "endorsed", pastLabel: "Qualified" },
  disqualify: { label: "Disqualify", icon: "disable", pastLabel: "Disqualified", intent: "danger" },
  snooze: { label: "Snooze 1d", icon: "moon", pastLabel: "Snoozed for 1 day" },
  nurture: { label: "Nurture", icon: "send-to", pastLabel: "Moved to nurture" },
  escalate: { label: "Escalate", icon: "warning-sign", pastLabel: "Escalated to manager", intent: "warning" },
};

export const CHANNEL_META: Record<ActivityChannel, { label: string; icon: IconName }> = {
  call: { label: "Call", icon: "phone" },
  email: { label: "Email", icon: "envelope" },
  meeting: { label: "Meeting", icon: "people" },
};

export function isSnoozed(snoozedUntil: string | null, now = Date.now()): boolean {
  return snoozedUntil !== null && new Date(snoozedUntil).getTime() > now;
}
