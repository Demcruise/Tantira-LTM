import type { Lead } from "../types";
import { getEnrichmentData } from "./enrichment";
import { computeSlaStatus } from "./sla";
import { isSnoozed } from "./leadActions";
import { computeReason, REASON_ACTION } from "./needsAttention";
import { explainLead, type LeadRecommendation } from "./recommendation";
import { sequenceProgress } from "./downstream";

export interface LeadBrief {
  summary: string;
  signals: string[];
  recommendationText: string;
  why: string;
  nextAction: string;
}

function buildSummary(lead: Lead): string {
  const data = getEnrichmentData(lead);
  const sla = computeSlaStatus(lead);
  const fit =
    data.segment === "Enterprise" ? "High-fit enterprise" : data.segment === "Mid-market" ? "Solid mid-market" : "Early-stage";
  const engagement =
    data.engagementEvents >= 6 ? "strong engagement" : data.engagementEvents >= 3 ? "moderate engagement" : "limited engagement so far";
  const urgency = sla.risk === "overdue" ? " — SLA already breached" : sla.risk === "atRisk" ? " — SLA closing soon" : "";
  return `${fit} lead from ${lead.company}, ${data.industry.toLowerCase()}, with ${engagement}${urgency}.`;
}

function buildRecommendationText(lead: Lead, recommendation: LeadRecommendation | null): string {
  if (lead.assignedTo) {
    const overridden = lead.decision?.status === "overridden";
    return overridden ? `${lead.assignedTo} (overridden from ${lead.decision?.recommendedOwner ?? "recommendation"})` : lead.assignedTo;
  }
  if (recommendation?.owner) return `Assign to ${recommendation.owner}`;
  return "No eligible rep — check territory or capacity";
}

function buildWhy(lead: Lead, recommendation: LeadRecommendation | null): string {
  if (lead.assignedTo && lead.decision) {
    return lead.decision.status === "accepted"
      ? `Recommendation accepted by ${lead.decision.decidedBy}.`
      : `${lead.decision.decidedBy} overrode for: ${lead.decision.reason}.`;
  }
  if (lead.assignedTo) return "Assigned outside the recommendation flow.";
  if (recommendation) return recommendation.ownerBasis;
  return "No rule matched and no rep has capacity or territory fit.";
}

function buildNextAction(lead: Lead, leads: Lead[]): string {
  if (isSnoozed(lead.snoozedUntil)) {
    return `Snoozed until ${new Date(lead.snoozedUntil as string).toLocaleString()} — no action needed now.`;
  }

  const reason = computeReason(lead, leads);
  if (reason) return REASON_ACTION[reason].description;

  if (lead.outcome === "Won") return "Won — kick off the onboarding sequence below.";
  if (lead.outcome === "Lost") {
    return lead.downstream ? `Moved to ${sequenceProgress(lead.downstream).def.label} — no action needed.` : "Lost — no action needed.";
  }
  if (lead.status === "Assigned") return "Reach out — first response starts the SLA clock.";
  if (lead.status === "Contacted") return "Qualify or disqualify based on the conversation.";
  if (lead.status === "Qualified") return "Move toward close — log Won or Lost once decided.";
  return "On track — no action needed right now.";
}

export function buildLeadBrief(lead: Lead, leads: Lead[], recommendation: LeadRecommendation | null): LeadBrief {
  const signals = [...explainLead(lead)];
  if (lead.outcome) {
    signals.push(`Outcome logged: ${lead.outcome}${lead.outcomeReason ? ` — ${lead.outcomeReason}` : ""}`);
  }

  return {
    summary: buildSummary(lead),
    signals,
    recommendationText: buildRecommendationText(lead, recommendation),
    why: buildWhy(lead, recommendation),
    nextAction: buildNextAction(lead, leads),
  };
}
