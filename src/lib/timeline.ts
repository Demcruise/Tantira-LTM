import type { IconName } from "@blueprintjs/icons";
import type { Lead } from "../types";
import { LEAD_ACTION_META } from "./leadActions";

export interface TimelineEvent {
  time: string;
  label: string;
  icon: IconName;
}

function addMinutes(iso: string, minutes: number): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

export function buildTimeline(lead: Lead): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { time: lead.createdAt, label: "Lead captured", icon: "inbox" },
    { time: addMinutes(lead.createdAt, 2), label: "Enriched via Clearbit API", icon: "new-object" },
    { time: addMinutes(lead.createdAt, 3), label: `Prioritized ${lead.score}/100 → ${lead.priority}`, icon: "calculator" },
  ];

  if (lead.assignedTo) {
    events.push({ time: addMinutes(lead.createdAt, 5), label: `Assigned to ${lead.assignedTo}`, icon: "person" });
  }

  if (lead.writebackState === "synced" && lead.syncedAt) {
    events.push({ time: lead.syncedAt, label: "Synced to CRM (Salesforce)", icon: "cloud-upload" });
  }
  if (lead.writebackState === "failed") {
    events.push({ time: addMinutes(lead.createdAt, 8), label: "CRM sync failed", icon: "warning-sign" });
  }

  if (lead.inNurture) {
    events.push({ time: addMinutes(lead.createdAt, 10), label: "Entered nurture sequence", icon: "send-to" });
  }

  if (lead.decision) {
    const label =
      lead.decision.status === "accepted"
        ? `Recommendation accepted — ${lead.decision.chosenOwner}`
        : `Recommendation overridden — ${lead.decision.chosenOwner} (${lead.decision.reason})`;
    events.push({ time: lead.decision.decidedAt, label, icon: lead.decision.status === "accepted" ? "thumbs-up" : "swap-horizontal" });
  }

  for (const action of lead.actions) {
    events.push({ time: action.time, label: `${LEAD_ACTION_META[action.type].pastLabel} by ${action.actor}`, icon: LEAD_ACTION_META[action.type].icon });
  }

  if (lead.outcome) {
    events.push({ time: lead.lastActivity, label: `Outcome logged: ${lead.outcome}${lead.outcomeReason && lead.outcomeReason !== lead.outcome ? ` — ${lead.outcomeReason}` : ""}`, icon: "flag" });
  }

  if (lead.downstream) {
    const label = lead.downstream.kind === "onboarding" ? "Onboarding started" : lead.downstream.kind === "re_engagement" ? "Re-engagement nurture started" : "Nurture sequence started";
    events.push({ time: lead.downstream.startedAt, label, icon: "flows" });
  }

  events.push({ time: lead.lastActivity, label: "Last activity recorded", icon: "history" });

  return events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}
