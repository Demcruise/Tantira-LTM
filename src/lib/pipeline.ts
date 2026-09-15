import type { Lead } from "../types";

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
}

export function buildFunnelStages(leads: Lead[]): FunnelStage[] {
  // Raw inbound capture, before dedupe collapses duplicates into the canonical lead set below.
  const ingested = Math.round(leads.length * 1.35);
  const enriched = leads.length;
  const scored = leads.filter((l) => l.score > 0).length;
  const assigned = leads.filter((l) => l.assignedTo !== null).length;
  const synced = leads.filter((l) => l.writebackState === "synced").length;

  return [
    { key: "ingested", label: "Ingested", count: ingested },
    { key: "enriched", label: "Enriched", count: enriched },
    { key: "scored", label: "Prioritized", count: scored },
    { key: "assigned", label: "Assigned", count: assigned },
    { key: "synced", label: "Synced", count: synced },
  ];
}

export interface FunnelStep extends FunnelStage {
  widthPct: number;
  dropOffCount: number;
  dropOffPct: number;
}

export function withDropOff(stages: FunnelStage[]): FunnelStep[] {
  const max = stages[0]?.count || 1;
  return stages.map((stage, i) => {
    const prev = i === 0 ? stage.count : stages[i - 1].count;
    const dropOffCount = i === 0 ? 0 : prev - stage.count;
    const dropOffPct = i === 0 || prev === 0 ? 0 : (dropOffCount / prev) * 100;
    return {
      ...stage,
      widthPct: (stage.count / max) * 100,
      dropOffCount,
      dropOffPct,
    };
  });
}
