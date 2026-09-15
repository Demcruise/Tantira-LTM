import type { Lead } from "../types";
import { REPS, type Rep } from "../data/reps";

export interface RepLoad {
  rep: Rep;
  total: number;
  ratio: number;
}

export function getOpenLeads(leads: Lead[]): Lead[] {
  return leads.filter((l) => l.status !== "Lost");
}

export function getRepLoad(leads: Lead[], repName: string): RepLoad | undefined {
  const rep = REPS.find((r) => r.name === repName);
  if (!rep) return undefined;
  const total = getOpenLeads(leads).filter((l) => l.assignedTo === repName).length;
  return { rep, total, ratio: total / rep.capacity };
}

export function loadColor(ratio: number): string {
  if (ratio >= 0.9) return "#CD4246";
  if (ratio >= 0.6) return "#C87619";
  return "#238551";
}

export function loadBg(ratio: number): string {
  if (ratio >= 0.9) return "rgba(205, 66, 70, 0.12)";
  if (ratio >= 0.6) return "rgba(200, 118, 25, 0.12)";
  return "rgba(35, 133, 81, 0.1)";
}
