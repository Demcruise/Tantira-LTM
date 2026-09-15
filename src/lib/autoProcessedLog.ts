import type { IconName } from "@blueprintjs/icons";
import type { AutoProcessedEntry, AutoProcessedEventType, Lead } from "../types";
import { sequenceProgress } from "./downstream";

function addMinutes(iso: string, minutes: number): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

export const EVENT_ICON: Record<AutoProcessedEventType, IconName> = {
  captured: "inbox",
  enriched: "new-object",
  scored: "calculator",
  synced: "cloud-upload",
  sync_failed: "warning-sign",
  nurture: "send-to",
  downstream: "flows",
};

export const EVENT_LABEL: Record<AutoProcessedEventType, string> = {
  captured: "Lead captured",
  enriched: "Enriched",
  scored: "Prioritized",
  synced: "Synced to CRM",
  sync_failed: "Sync failed",
  nurture: "Entered nurture",
  downstream: "Downstream step",
};

let counter = 0;

function entry(lead: Lead, eventType: AutoProcessedEventType, time: string, label: string, detail?: string): AutoProcessedEntry {
  counter += 1;
  return { id: `AP-${counter}`, leadId: lead.id, leadName: lead.name, time, eventType, label, detail };
}

// Only events the system performed on its own — human-initiated actions (manual
// assignment, outcome logging) live in the platform Audit Log instead. This is the
// "did the automation actually run" trust feed, not a who-did-what record.
export function buildAutoProcessedLog(leads: Lead[]): AutoProcessedEntry[] {
  const entries: AutoProcessedEntry[] = [];

  for (const lead of leads) {
    entries.push(entry(lead, "captured", lead.createdAt, "Lead captured", lead.source));
    entries.push(
      entry(lead, "enriched", addMinutes(lead.createdAt, 2), "Enriched via Clearbit API", `${lead.accountMatch === "matched" ? "Matched existing account" : "New account"} — ${lead.company}`),
    );
    entries.push(
      entry(lead, "scored", addMinutes(lead.createdAt, 3), `Prioritized ${lead.score}/100`, `Priority set to ${lead.priority}`),
    );

    if (lead.writebackState === "synced" && lead.syncedAt) {
      entries.push(entry(lead, "synced", lead.syncedAt, "Synced to CRM (Salesforce)", lead.assignedTo ? `Owner: ${lead.assignedTo}` : undefined));
    }
    if (lead.writebackState === "failed") {
      entries.push(entry(lead, "sync_failed", addMinutes(lead.createdAt, 8), "CRM sync failed", "Awaiting retry"));
    }

    if (lead.inNurture && lead.downstream?.kind !== "nurture") {
      entries.push(entry(lead, "nurture", addMinutes(lead.createdAt, 10), "Entered nurture sequence", "Downstream marketing automation"));
    }

    if (lead.downstream) {
      const p = sequenceProgress(lead.downstream);
      entries.push(entry(lead, "downstream", lead.downstream.startedAt, `${p.def.label} started`, p.def.owner));
      p.stepTimes.forEach((time, i) => {
        entries.push(entry(lead, "downstream", time, `${p.def.label}: ${p.def.steps[i]}`, `Step ${i + 1} of ${p.total}`));
      });
    }
  }

  return entries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}
