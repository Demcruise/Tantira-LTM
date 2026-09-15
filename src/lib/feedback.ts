import type { Lead, OverrideReason, Priority } from "../types";

export interface TierFunnelRow {
  tier: Priority;
  predicted: number;
  assigned: number;
  contacted: number;
  qualified: number;
  won: number;
  lost: number;
  wonRate: number; // won / predicted, %
}

const TIERS: Priority[] = ["Hot", "Warm", "Cold"];

// Prediction (tier) vs what actually happened — the concrete definition of
// "prioritization accuracy": did Hot leads win more often than Warm and Cold?
export function buildTierFunnel(leads: Lead[]): TierFunnelRow[] {
  return TIERS.map((tier) => {
    const group = leads.filter((l) => l.priority === tier);
    const predicted = group.length;
    const assigned = group.filter((l) => l.assignedTo !== null || l.status === "Lost").length;
    const contacted = group.filter((l) => ["Contacted", "Qualified"].includes(l.status) || l.outcome !== null).length;
    const qualified = group.filter((l) => l.status === "Qualified" || l.outcome === "Won").length;
    const won = group.filter((l) => l.outcome === "Won").length;
    const lost = group.filter((l) => l.outcome === "Lost").length;
    return { tier, predicted, assigned, contacted, qualified, won, lost, wonRate: predicted === 0 ? 0 : Math.round((won / predicted) * 1000) / 10 };
  });
}

export interface ReasonCount {
  reason: string;
  count: number;
}

export function overrideBreakdown(leads: Lead[]): ReasonCount[] {
  const counts = new Map<OverrideReason, number>();
  for (const l of leads) {
    if (l.decision?.status === "overridden" && l.decision.reason) counts.set(l.decision.reason, (counts.get(l.decision.reason) ?? 0) + 1);
  }
  return [...counts.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);
}

export function outcomeReasonBreakdown(leads: Lead[], outcome: "Won" | "Lost"): ReasonCount[] {
  const counts = new Map<string, number>();
  for (const l of leads) {
    if (l.outcome === outcome && l.outcomeReason) counts.set(l.outcomeReason, (counts.get(l.outcomeReason) ?? 0) + 1);
  }
  return [...counts.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);
}

export function decisionStats(leads: Lead[]): { accepted: number; overridden: number; acceptanceRate: number } {
  const accepted = leads.filter((l) => l.decision?.status === "accepted").length;
  const overridden = leads.filter((l) => l.decision?.status === "overridden").length;
  const total = accepted + overridden;
  return { accepted, overridden, acceptanceRate: total === 0 ? 100 : Math.round((accepted / total) * 100) };
}

// One-line tuning suggestion derived from the signals above — the "learn" step made visible.
export function feedbackInsight(leads: Lead[]): string | null {
  const overrides = overrideBreakdown(leads);
  const top = overrides[0];
  if (top && top.count >= 2) {
    if (top.reason === "Territory ownership") return `"${top.reason}" is the most common override (${top.count}). Consider adding a territory condition to the assignment rules so routing matches how ops actually decides.`;
    if (top.reason === "Capacity") return `Ops overrides for capacity ${top.count}×. Rep capacity limits may be set too tight, or the round-robin pool too small.`;
    if (top.reason === "Rep specialization") return `Specialization drove ${top.count} overrides. A rule keyed on industry would let the engine make that call.`;
    return `"${top.reason}" is the most common override reason (${top.count}). Review whether a rule could encode it.`;
  }
  const funnel = buildTierFunnel(leads);
  const hot = funnel.find((f) => f.tier === "Hot");
  const warm = funnel.find((f) => f.tier === "Warm");
  if (hot && warm && warm.wonRate > hot.wonRate && warm.won > 0) {
    return `Warm leads are converting better than Hot (${warm.wonRate}% vs ${hot.wonRate}%). The Hot threshold may be too low — try raising it in the tier editor and watch the distribution.`;
  }
  return null;
}
