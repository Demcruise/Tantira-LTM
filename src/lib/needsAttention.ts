import type { AttentionReason, Lead, Priority } from "../types";
import { getRepLoad } from "./capacity";
import { computeSlaStatus } from "./sla";
import { isSnoozed } from "./leadActions";

export type { AttentionReason };

export const REASON_LABEL: Record<AttentionReason, string> = {
  sync_conflict: "Sync failed",
  rep_over_capacity: "Rep over capacity",
  ambiguous_match: "Ambiguous match",
  sla_at_risk: "SLA at risk",
  awaiting_assignment: "Awaiting owner decision",
};

// What a human is being asked to do — drives the inline action on each queue row.
export const REASON_ACTION: Record<AttentionReason, { label: string; description: string }> = {
  sync_conflict: { label: "Retry", description: "Couldn't update the CRM. Retry, or fix the conflict in Connections." },
  rep_over_capacity: { label: "Reassign", description: "Owner is at capacity. Reassign or confirm they can take it." },
  ambiguous_match: { label: "Resolve", description: "Enrichment found several possible accounts. Pick one so scoring and routing can continue." },
  sla_at_risk: { label: "Escalate", description: "Response window closing or breached. Escalate to the owner's manager or open and act." },
  awaiting_assignment: { label: "Assign", description: "Tantira has a recommended owner. Accept it or override with a reason." },
};

// Severity order for the Attention Center queue.
export const REASON_ORDER: AttentionReason[] = ["sync_conflict", "sla_at_risk", "ambiguous_match", "awaiting_assignment", "rep_over_capacity"];

export function computeReason(lead: Lead, leads: Lead[]): AttentionReason | null {
  if (isSnoozed(lead.snoozedUntil)) return null;
  if (lead.writebackState === "failed") return "sync_conflict";
  if (lead.assignedTo) {
    const load = getRepLoad(leads, lead.assignedTo);
    if (load && load.ratio >= 0.9) return "rep_over_capacity";
  }
  if (lead.accountMatch === "ambiguous") return "ambiguous_match";
  const { risk } = computeSlaStatus(lead);
  if (risk === "atRisk" || risk === "overdue") return "sla_at_risk";
  if (lead.assignedTo === null) return "awaiting_assignment";
  return null;
}

export function buildAttentionQueue(leads: Lead[]): NeedsAttentionLead[] {
  const priorityRank: Record<Priority, number> = { Hot: 0, Warm: 1, Cold: 2 };
  return leads
    .filter((l) => l.status !== "Lost")
    .map((lead) => ({ lead, reason: computeReason(lead, leads) }))
    .filter((x): x is NeedsAttentionLead => x.reason !== null)
    .sort(
      (a, b) =>
        REASON_ORDER.indexOf(a.reason) - REASON_ORDER.indexOf(b.reason) ||
        priorityRank[a.lead.priority] - priorityRank[b.lead.priority] ||
        computeSlaStatus(a.lead).remainingHours - computeSlaStatus(b.lead).remainingHours,
    );
}

export interface NeedsAttentionLead {
  lead: Lead;
  reason: AttentionReason;
}

export function countNeedsAttention(leads: Lead[]): number {
  return leads.filter((lead) => lead.status !== "Lost" && computeReason(lead, leads) !== null).length;
}
