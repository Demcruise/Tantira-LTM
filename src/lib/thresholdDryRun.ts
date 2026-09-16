import type { Lead, Priority, TierThresholds } from "../types";
import { scoreToPriority } from "./scoring";

const TIER_RANK: Record<Priority, number> = { Cold: 0, Warm: 1, Hot: 2 };
const TIERS: Priority[] = ["Hot", "Warm", "Cold"];

export interface TierMove {
  lead: Lead;
  currentTier: Priority;
  simulatedTier: Priority;
  direction: "up" | "down";
}

export interface TierOutcomeRow {
  tier: Priority;
  count: number;
  won: number;
  wonRate: number;
}

export interface ThresholdDryRunResult {
  moves: TierMove[];
  upgrades: number;
  downgrades: number;
  current: TierOutcomeRow[];
  simulated: TierOutcomeRow[];
}

function wonRateByTier(leads: Lead[], tierOf: (lead: Lead) => Priority): TierOutcomeRow[] {
  return TIERS.map((tier) => {
    const group = leads.filter((l) => tierOf(l) === tier);
    const won = group.filter((l) => l.outcome === "Won").length;
    return { tier, count: group.length, won, wonRate: group.length === 0 ? 0 : Math.round((won / group.length) * 1000) / 10 };
  });
}

// Compares every lead's live tier against what it would be under draft thresholds,
// without touching any lead — a preview, not a re-tier.
export function runThresholdDryRun(leads: Lead[], draftThresholds: TierThresholds): ThresholdDryRunResult {
  const moves: TierMove[] = [];
  for (const lead of leads) {
    const simulatedTier = scoreToPriority(lead.score, draftThresholds);
    if (simulatedTier !== lead.priority) {
      moves.push({
        lead,
        currentTier: lead.priority,
        simulatedTier,
        direction: TIER_RANK[simulatedTier] > TIER_RANK[lead.priority] ? "up" : "down",
      });
    }
  }

  return {
    moves,
    upgrades: moves.filter((m) => m.direction === "up").length,
    downgrades: moves.filter((m) => m.direction === "down").length,
    current: wonRateByTier(leads, (l) => l.priority),
    simulated: wonRateByTier(leads, (l) => scoreToPriority(l.score, draftThresholds)),
  };
}
