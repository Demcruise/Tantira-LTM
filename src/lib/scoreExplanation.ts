import type { Lead, ScoringRule } from "../types";
import { getEnrichmentData } from "./enrichment";
import { clampScore } from "./scoring";

const FREE_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];

function hash(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

// Real fields only where the data model actually has them (source, enrichment, activity,
// email domain). Signals with no backing field (budget, title, competitor) fall back to a
// per-lead-stable hash — the same "fabricated but consistent" convention enrichment.ts
// already uses, so a lead's breakdown doesn't change between renders.
const RULE_MATCHERS: Record<string, (lead: Lead) => boolean> = {
  "sr-1": (lead) => getEnrichmentData(lead).segment === "Enterprise",
  "sr-2": (lead) => lead.source === "Referral" || lead.source === "Partner",
  "sr-3": (lead) => hash(lead.id + "budget", 100) < 40,
  "sr-4": (lead) => getEnrichmentData(lead).engagementEvents >= 3,
  "sr-5": (lead) => hash(lead.id + "title", 100) < 25,
  "sr-6": (lead) => (Date.now() - new Date(lead.lastActivity).getTime()) / 86_400_000 >= 30,
  "sr-7": (lead) => hash(lead.id + "competitor", 100) < 15,
  "sr-8": (lead) => FREE_EMAIL_DOMAINS.some((d) => lead.email.toLowerCase().endsWith(`@${d}`)),
};

export interface ScoreBreakdownRow {
  rule: ScoringRule;
  matched: boolean | null; // null = no rule for this custom rule, can't auto-evaluate
  pointsApplied: number;
}

export interface ScoreExplanation {
  computedScore: number;
  breakdown: ScoreBreakdownRow[];
  unevaluableCount: number;
}

// What today's active scoring rules say about a real lead — independent of the lead's
// stored score, which was set at capture time and may predate rule changes. Divergence
// between the two is itself a signal (see ModelFeedbackPanel).
export function explainScore(lead: Lead, rules: ScoringRule[]): ScoreExplanation {
  const activeRules = rules.filter((r) => r.status === "active");
  const breakdown: ScoreBreakdownRow[] = activeRules.map((rule) => {
    const matcher = RULE_MATCHERS[rule.id];
    const matched = matcher ? matcher(lead) : null;
    return { rule, matched, pointsApplied: matched ? rule.points : 0 };
  });

  const rawTotal = breakdown.reduce((sum, b) => sum + b.pointsApplied, 0);

  return {
    computedScore: clampScore(rawTotal),
    breakdown,
    unevaluableCount: breakdown.filter((b) => b.matched === null).length,
  };
}
