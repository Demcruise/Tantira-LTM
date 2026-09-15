import type { ScoringRule, TierThresholds } from "../types";

export const INITIAL_SCORING_RULES: ScoringRule[] = [
  { id: "sr-1", description: "Company size 500+ employees", points: 15, status: "active" },
  { id: "sr-2", description: "Referral source", points: 20, status: "active" },
  { id: "sr-3", description: "Budget confirmed", points: 25, status: "active" },
  { id: "sr-4", description: "Engaged with 3+ emails", points: 10, status: "active" },
  { id: "sr-5", description: "Job title includes 'Director' or above", points: 12, status: "active" },
  { id: "sr-6", description: "No response in 30+ days", points: -15, status: "active" },
  { id: "sr-7", description: "Currently evaluating a competitor", points: -10, status: "active" },
  { id: "sr-8", description: "Free/trial email domain", points: -8, status: "inactive" },
];

export const INITIAL_TIER_THRESHOLDS: TierThresholds = {
  hotMin: 75,
  warmMin: 45,
};
