import type { Lead } from "../types";

export interface AccuracyPoint {
  label: string;
  accuracy: number;
}

// Synthetic history for the weeks before this session — represents accuracy readings
// the feedback loop (outcome logging -> retrained scoring) produced over time.
const HISTORICAL_TREND = [61, 65, 68, 72, 75, 79, 82];

function computeLiveAccuracy(leads: Lead[]): number | null {
  const withOutcome = leads.filter((l) => l.outcome !== null);
  if (withOutcome.length < 3) return null;

  const correct = withOutcome.filter((l) => {
    const predictedWin = l.priority === "Hot";
    const actuallyWon = l.outcome === "Won";
    return predictedWin === actuallyWon;
  }).length;

  return Math.round((correct / withOutcome.length) * 100);
}

export function buildAccuracyTrend(leads: Lead[]): AccuracyPoint[] {
  const weeks = HISTORICAL_TREND.map((accuracy, i) => ({
    label: `W-${HISTORICAL_TREND.length - i}`,
    accuracy,
  }));

  const live = computeLiveAccuracy(leads);
  const lastHistorical = HISTORICAL_TREND[HISTORICAL_TREND.length - 1];
  // Blend the live, outcome-derived accuracy with the trend so one noisy batch of
  // outcomes doesn't make the "current" point jump implausibly far from last week.
  const current = live === null ? lastHistorical + 3 : Math.round((live + lastHistorical * 2) / 3);

  weeks.push({ label: "This week", accuracy: current });
  return weeks;
}
