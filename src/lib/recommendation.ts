import type { AssignmentRule, Lead, Priority, TierThresholds } from "../types";
import { REPS } from "../data/reps";
import { getEnrichmentData } from "./enrichment";
import { getRepLoad } from "./capacity";
import { computeSlaStatus } from "./sla";
import { assignByRules, summarizeConditions } from "./ruleEngine";
import { priorityConfidence, scoreToPriority } from "./scoring";

export interface RepEligibility {
  rep: string;
  eligible: boolean;
  load: string; // "5/8"
  checks: { label: string; ok: boolean }[];
}

export interface LeadRecommendation {
  priority: Priority;
  confidence: number;
  reasons: string[];
  owner: string | null;
  ownerBasis: string;
  eligibility: RepEligibility[];
}

// "Why this lead matters" — the same explanation shown to reps in My Leads and to
// ops in the recommendation card, so both personas see one story.
export function explainLead(lead: Lead): string[] {
  const data = getEnrichmentData(lead);
  const reasons: string[] = [];
  if (data.segment === "Enterprise") reasons.push(`Enterprise account (${data.employeeBand} employees)`);
  else if (data.segment === "Mid-market") reasons.push(`Mid-market (${data.employeeBand} employees)`);
  if (lead.source === "Referral" || lead.source === "Partner") reasons.push(`${lead.source} source — high intent`);
  if (lead.accountMatch === "matched") reasons.push("Matched to an existing account");
  if (data.engagementEvents >= 6) reasons.push(`High engagement (${data.engagementEvents} events)`);
  const sla = computeSlaStatus(lead);
  if (sla.risk === "overdue") reasons.push(`SLA breached — ${sla.label.toLowerCase()}`);
  else if (sla.risk === "atRisk") reasons.push(`SLA window closing — ${sla.label}`);
  if (reasons.length === 0) reasons.push(`${data.industry} · ${data.region}`);
  return reasons;
}

export function recommendFor(lead: Lead, leads: Lead[], rules: AssignmentRule[], thresholds: TierThresholds): LeadRecommendation {
  const data = getEnrichmentData(lead);
  const priority = scoreToPriority(lead.score, thresholds);
  const confidence = priorityConfidence(lead.score, thresholds);

  const eligibility: RepEligibility[] = REPS.map((rep) => {
    const load = getRepLoad(leads, rep.name);
    const total = load?.total ?? 0;
    const checks = [
      { label: total < rep.capacity ? `Capacity ${total}/${rep.capacity}` : `At capacity ${total}/${rep.capacity}`, ok: total < rep.capacity },
      { label: rep.territory.includes(data.region) ? `Territory: ${data.region}` : `Outside territory (${rep.territory.join(", ")})`, ok: rep.territory.includes(data.region) },
      { label: rep.specialties.includes(data.industry) ? `Specialty: ${data.industry}` : `No ${data.industry} specialty`, ok: rep.specialties.includes(data.industry) },
    ];
    return { rep: rep.name, eligible: checks[0].ok && checks[1].ok, load: `${total}/${rep.capacity}`, checks };
  });

  const [plan] = assignByRules(leads, rules, [lead]);
  let owner: string | null = null;
  let ownerBasis = "";
  if (plan) {
    const rule = rules.find((r) => r.id === plan.ruleId);
    owner = plan.assignee;
    ownerBasis = rule ? `Rule #${rule.priority}: ${summarizeConditions(rule.conditions, rule.conditionLogic)}` : "Assignment rules";
  } else {
    const best = eligibility
      .filter((e) => e.eligible)
      .sort((a, b) => a.checks.filter((c) => c.ok).length - b.checks.filter((c) => c.ok).length)
      .pop();
    owner = best?.rep ?? null;
    ownerBasis = best ? "Best available by territory, specialty and capacity" : "No rep has capacity in this territory";
  }

  return { priority, confidence, reasons: explainLead(lead), owner, ownerBasis, eligibility };
}
