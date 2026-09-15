import type { Lead, Priority } from "../types";
import { REPS } from "../data/reps";
import { computeSlaStatus } from "./sla";
import { buildTierFunnel, decisionStats } from "./feedback";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function hoursBetween(a: string, b: string): number {
  return Math.max(0, (new Date(b).getTime() - new Date(a).getTime()) / HOUR);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// First human touch: an explicit Contact action if one exists, otherwise the last activity
// on an assigned lead is the best proxy the demo data offers.
export function firstResponseHours(lead: Lead): number | null {
  const contact = lead.actions.find((a) => a.type === "contact");
  if (contact) return hoursBetween(lead.createdAt, contact.time);
  if (lead.assignedTo && ["Contacted", "Qualified"].includes(lead.status)) return hoursBetween(lead.createdAt, lead.lastActivity);
  return null;
}

export interface DailyVolume {
  label: string;
  count: number;
}

export function dailyVolume(leads: Lead[], days = 7, now = Date.now()): DailyVolume[] {
  return Array.from({ length: days }, (_, i) => {
    const dayStart = new Date(now - (days - 1 - i) * DAY);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dayStart.getTime() + DAY;
    const count = leads.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= dayStart.getTime() && t < dayEnd;
    }).length;
    return { label: dayStart.toLocaleDateString(undefined, { weekday: "short" }), count };
  });
}

export interface SourceRow {
  source: string;
  leads: number;
  hotShare: number; // %
  won: number;
  winRate: number; // %
}

export function sourcePerformance(leads: Lead[]): SourceRow[] {
  const bySource = new Map<string, Lead[]>();
  for (const l of leads) bySource.set(l.source, [...(bySource.get(l.source) ?? []), l]);
  return [...bySource.entries()]
    .map(([source, group]) => ({
      source,
      leads: group.length,
      hotShare: Math.round((group.filter((l) => l.priority === "Hot").length / group.length) * 100),
      won: group.filter((l) => l.outcome === "Won").length,
      winRate: Math.round((group.filter((l) => l.outcome === "Won").length / group.length) * 100),
    }))
    .sort((a, b) => b.leads - a.leads);
}

export interface RepRow {
  rep: string;
  open: number;
  hot: number;
  capacity: number;
  breaches: number;
  contacted: number;
  won: number;
  winRate: number;
  medianResponseHours: number | null;
}

export function repPerformance(leads: Lead[]): RepRow[] {
  return REPS.map((rep) => {
    const mine = leads.filter((l) => l.assignedTo === rep.name);
    const open = mine.filter((l) => l.status !== "Lost");
    const responses = mine.map(firstResponseHours).filter((h): h is number => h !== null);
    return {
      rep: rep.name,
      open: open.length,
      hot: open.filter((l) => l.priority === "Hot").length,
      capacity: rep.capacity,
      breaches: open.filter((l) => computeSlaStatus(l).risk === "overdue").length,
      contacted: mine.filter((l) => ["Contacted", "Qualified"].includes(l.status) || l.outcome !== null).length,
      won: mine.filter((l) => l.outcome === "Won").length,
      winRate: mine.length === 0 ? 0 : Math.round((mine.filter((l) => l.outcome === "Won").length / mine.length) * 100),
      medianResponseHours: median(responses),
    };
  });
}

export interface SlaByTier {
  tier: Priority;
  open: number;
  onTrack: number;
  compliance: number; // %
}

export function slaByTier(leads: Lead[]): SlaByTier[] {
  return (["Hot", "Warm", "Cold"] as Priority[]).map((tier) => {
    const open = leads.filter((l) => l.status !== "Lost" && l.priority === tier);
    const onTrack = open.filter((l) => computeSlaStatus(l).risk === "onTrack").length;
    return { tier, open: open.length, onTrack, compliance: open.length === 0 ? 100 : Math.round((onTrack / open.length) * 100) };
  });
}

export interface PerformanceSummary {
  leads7d: number;
  medianResponseHours: number | null;
  slaCompliance: number;
  winRate: number;
  won: number;
  closed: number;
  routing: { autoAssigned: number; humanDecided: number; acceptanceRate: number; overridden: number; unassigned: number };
  model: { hotWonRate: number; warmWonRate: number; healthy: boolean };
}

export function performanceSummary(leads: Lead[], now = Date.now()): PerformanceSummary {
  const open = leads.filter((l) => l.status !== "Lost");
  const closed = leads.filter((l) => l.outcome !== null).length;
  const won = leads.filter((l) => l.outcome === "Won").length;
  const responses = leads.map(firstResponseHours).filter((h): h is number => h !== null);
  const decisions = decisionStats(leads);
  const funnel = buildTierFunnel(leads);
  const hot = funnel.find((f) => f.tier === "Hot")?.wonRate ?? 0;
  const warm = funnel.find((f) => f.tier === "Warm")?.wonRate ?? 0;
  return {
    leads7d: leads.filter((l) => now - new Date(l.createdAt).getTime() <= 7 * DAY).length,
    medianResponseHours: median(responses),
    slaCompliance: open.length === 0 ? 100 : Math.round((open.filter((l) => computeSlaStatus(l).risk === "onTrack").length / open.length) * 100),
    winRate: closed === 0 ? 0 : Math.round((won / closed) * 100),
    won,
    closed,
    routing: {
      autoAssigned: leads.filter((l) => l.assignedTo && !l.decision).length,
      humanDecided: decisions.accepted + decisions.overridden,
      acceptanceRate: decisions.acceptanceRate,
      overridden: decisions.overridden,
      unassigned: open.filter((l) => l.assignedTo === null).length,
    },
    model: { hotWonRate: hot, warmWonRate: warm, healthy: hot >= warm },
  };
}

export function formatHours(h: number | null): string {
  if (h === null) return "—";
  if (h < 1) return `${Math.round(h * 60)}m`;
  return `${h.toFixed(1)}h`;
}
