import type { Lead } from "../types";

// Per-lead sanity check: did the model's tier actually predict what happened?
// Aggregate accuracy already lives in ModelFeedbackPanel — this is the same
// question asked about one specific lead, right where a rep is looking at it.
export function predictionOutcomeInsight(lead: Lead): string | null {
  if (!lead.outcome || lead.outcome === "No response") return null;

  if (lead.priority === "Hot" && lead.outcome === "Lost") {
    return `Predicted Hot but lost${lead.outcomeReason ? ` (${lead.outcomeReason})` : ""} — worth checking whether the signals behind this score still hold for similar leads.`;
  }
  if (lead.priority === "Cold" && lead.outcome === "Won") {
    return `Predicted Cold but won${lead.outcomeReason ? ` (${lead.outcomeReason})` : ""} — the model may be missing a signal that mattered here.`;
  }
  if (lead.priority === "Hot" && lead.outcome === "Won") return "Prediction aligned with outcome — Hot converted.";
  if (lead.priority === "Cold" && lead.outcome === "Lost") return "Prediction aligned with outcome — Cold did not convert.";
  return null;
}

export function predictionDiverged(lead: Lead): boolean {
  return (lead.priority === "Hot" && lead.outcome === "Lost") || (lead.priority === "Cold" && lead.outcome === "Won");
}
