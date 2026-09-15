import type { Lead } from "../types";
import { scoreToPriority } from "../lib/scoring";

const names = [
  ["Amara Wicaksono", "Nusantara Retail"],
  ["Bimo Santoso", "Kirana Logistics"],
  ["Citra Dewanti", "Beringin Capital"],
  ["Dimas Prakoso", "Sawala Tech"],
  ["Eka Putri", "Melati Health"],
  ["Farhan Ardiansyah", "Garuda Freight"],
  ["Gita Larasati", "Cendana Media"],
  ["Hendra Wijaya", "Rimba Energy"],
  ["Indah Permata", "Anggrek Fintech"],
  ["Joko Sudrajat", "Waringin Foods"],
  ["Kirana Ayu", "Padma Insurance"],
  ["Lukman Hakim", "Teratai Cloud"],
  ["Maya Kusuma", "Sakura Interiors"],
  ["Nanda Firmansyah", "Kartika Motors"],
  ["Olivia Salsabila", "Melur Analytics"],
  ["Prasetyo Aji", "Cempaka Realty"],
  ["Qonita Rahma", "Dahlia Studio"],
  ["Rangga Saputra", "Flamboyan Bank"],
  ["Salsa Amelia", "Seruni Retail"],
  ["Taufik Hidayat", "Bougenville Group"],
];

const sources = ["Website Form", "LinkedIn Ads", "Referral", "Webinar", "Cold Outreach", "Partner"];
const assignees = ["Rina Marlina", "Adi Nugraha", "Sari Handayani", null, null];
const statuses: Lead["status"][] = ["New", "Contacted", "Qualified", "Assigned", "Lost"];

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

export const mockLeads: Lead[] = names.map(([name, company], i) => {
  const score = (i * 37 + 13) % 100;
  const status = statuses[i % statuses.length];
  const namedAssignees = assignees.filter((a): a is string => a !== null);
  const assignedTo =
    status === "New" || status === "Lost" ? null : namedAssignees[i % namedAssignees.length];

  let writebackState: Lead["writebackState"] = "idle";
  if (assignedTo !== null) {
    writebackState = i % 4 === 0 ? "failed" : "synced";
  }
  const syncedAt = writebackState === "synced" ? hoursAgo((i * 2) % 12) : null;
  const inNurture = writebackState === "synced" && i % 2 === 0;
  // Won lands on synced, assigned leads; a couple of contacted leads close as Lost so
  // the feedback loop has both sides of the signal from the start.
  const outcome: Lead["outcome"] = writebackState === "synced" && i % 5 === 3 ? "Won" : status === "Contacted" && i % 2 === 1 ? "Lost" : null;

  const domainSlug = company.toLowerCase().replace(/\s+/g, "");
  const accountMatch: Lead["accountMatch"] = i === 10 || i % 6 === 0 ? "ambiguous" : i % 3 === 0 ? "new" : "matched";
  const candidateAccounts =
    accountMatch === "ambiguous" ? [`${company} Group (${domainSlug}.co.id)`, `${company} Ltd (${domainSlug}.com)`] : [];

  return {
    id: `LD-${1000 + i}`,
    name,
    company,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@${company.toLowerCase().replace(/\s+/g, "")}.co`,
    source: sources[i % sources.length],
    score,
    priority: scoreToPriority(score),
    status,
    assignedTo,
    writebackState,
    syncedAt,
    inNurture,
    downstream: outcome === "Won" ? { kind: "onboarding", startedAt: hoursAgo(((i * 2) % 12) - 1) } : inNurture ? { kind: "nurture", startedAt: syncedAt ?? hoursAgo(1) } : null,
    outcome,
    outcomeReason: outcome === "Won" ? (i % 2 === 0 ? "Product fit" : "Fast response") : outcome === "Lost" ? (i % 3 === 0 ? "Chose competitor" : "Timing") : null,
    accountMatch,
    candidateAccounts,
    createdAt: hoursAgo((i * 3 + 1) % 30),
    lastActivity: hoursAgo((i * 2) % 12),
    snoozedUntil: null,
    followUpDueAt: null,
    actions: [],
    decision: null,
  };
});
