import type { Priority, TierThresholds } from "../types";

export const DEFAULT_THRESHOLDS: TierThresholds = { hotMin: 75, warmMin: 45 };

export function scoreToPriority(score: number, thresholds: TierThresholds = DEFAULT_THRESHOLDS): Priority {
  if (score >= thresholds.hotMin) return "Hot";
  if (score >= thresholds.warmMin) return "Warm";
  return "Cold";
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

// How far the score sits from the nearest tier boundary, expressed as a confidence
// percentage — a score sitting right on the line is genuinely ambiguous; one deep
// inside a tier is not.
export function priorityConfidence(score: number, thresholds: TierThresholds = DEFAULT_THRESHOLDS): number {
  const { hotMin, warmMin } = thresholds;
  let margin: number;
  if (score >= hotMin) {
    margin = score - hotMin;
  } else if (score >= warmMin) {
    margin = Math.min(score - warmMin, hotMin - 1 - score);
  } else {
    margin = warmMin - 1 - score;
  }
  return Math.max(55, Math.min(99, 62 + margin * 2));
}
