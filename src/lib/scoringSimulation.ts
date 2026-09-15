import type { Priority, ScoringRule, SimulationResult, TierThresholds } from "../types";
import { clampScore } from "./scoring";

export function tierForScore(score: number, thresholds: TierThresholds): Priority {
  if (score >= thresholds.hotMin) return "Hot";
  if (score >= thresholds.warmMin) return "Warm";
  return "Cold";
}

export function runSimulation(
  appliedRuleIds: Set<string>,
  rules: ScoringRule[],
  thresholds: TierThresholds,
): SimulationResult {
  const breakdown = rules
    .filter((r) => r.status === "active" && appliedRuleIds.has(r.id))
    .map((r) => ({ ruleId: r.id, description: r.description, pointsApplied: r.points }));

  const rawTotal = breakdown.reduce((sum, b) => sum + b.pointsApplied, 0);
  const totalScore = clampScore(rawTotal);

  return {
    totalScore,
    breakdown,
    resultingTier: tierForScore(totalScore, thresholds),
  };
}

export interface TierDistribution {
  hot: number;
  warm: number;
  cold: number;
  hotPct: number;
  warmPct: number;
  coldPct: number;
}

export function computeDistribution(scores: number[], thresholds: TierThresholds): TierDistribution {
  const total = scores.length || 1;
  let hot = 0;
  let warm = 0;
  let cold = 0;
  for (const s of scores) {
    const tier = tierForScore(s, thresholds);
    if (tier === "Hot") hot++;
    else if (tier === "Warm") warm++;
    else cold++;
  }
  return {
    hot,
    warm,
    cold,
    hotPct: Math.round((hot / total) * 100),
    warmPct: Math.round((warm / total) * 100),
    coldPct: Math.round((cold / total) * 100),
  };
}
