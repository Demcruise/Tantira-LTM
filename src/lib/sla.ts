import { SLA_HOURS_BY_PRIORITY, type Lead } from "../types";

export type SlaRisk = "overdue" | "atRisk" | "onTrack";

export const SLA_RISK_COLOR: Record<SlaRisk, string> = {
  overdue: "#CD4246",
  atRisk: "#C87619",
  onTrack: "#238551",
};

export function formatSlaHours(hours: number): string {
  const abs = Math.abs(hours);
  if (abs < 1) return `${Math.round(abs * 60)}m`;
  return `${abs.toFixed(abs < 10 ? 1 : 0)}h`;
}

export interface SlaStatus {
  risk: SlaRisk;
  remainingHours: number;
  label: string;
}

export function computeSlaStatus(lead: Pick<Lead, "priority" | "createdAt">, now: number = Date.now()): SlaStatus {
  const slaHours = SLA_HOURS_BY_PRIORITY[lead.priority];
  const deadline = new Date(lead.createdAt).getTime() + slaHours * 60 * 60 * 1000;
  const remainingHours = (deadline - now) / (1000 * 60 * 60);

  if (remainingHours <= 0) {
    return { risk: "overdue", remainingHours, label: `Overdue ${formatSlaHours(remainingHours)}` };
  }
  if (remainingHours <= slaHours * 0.25) {
    return { risk: "atRisk", remainingHours, label: `${formatSlaHours(remainingHours)} left` };
  }
  return { risk: "onTrack", remainingHours, label: `${formatSlaHours(remainingHours)} left` };
}
