import type { AuditActor, AuditLogEntry } from "../types";

const USER_AGENTS = [
  "Chrome 128 / macOS",
  "Chrome 128 / Windows",
  "Safari 17 / macOS",
  "Firefox 130 / Windows",
];

function pseudoIp(seed: number): string {
  return `10.${(seed * 7) % 256}.${(seed * 13) % 256}.${(seed * 3 + 1) % 256}`;
}

export function createAuditEntry(params: {
  actor: AuditActor;
  action: string;
  object: string;
  before?: string;
  after?: string;
  timestamp?: string;
}): AuditLogEntry {
  const seq = Math.floor(Math.random() * 1_000_000);
  return {
    id: `AL-${Date.now()}-${seq}`,
    timestamp: params.timestamp ?? new Date().toISOString(),
    actor: params.actor,
    action: params.action,
    object: params.object,
    before: params.before,
    after: params.after,
    ip: pseudoIp(seq),
    userAgent: USER_AGENTS[seq % USER_AGENTS.length],
  };
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

export const SEED_AUDIT_LOG: AuditLogEntry[] = [
  createAuditEntry({
    actor: { type: "user", name: "Rina Cahyani" },
    action: "Changed threshold",
    object: "Priority scoring model",
    before: "Hot ≥ 70",
    after: "Hot ≥ 75",
    timestamp: hoursAgo(2),
  }),
  createAuditEntry({
    actor: { type: "user", name: "Rina Cahyani" },
    action: "Edited assignment rule",
    object: "Rule #2",
    before: "score > 70 AND source = Referral",
    after: "score > 60 AND source = Referral",
    timestamp: hoursAgo(3),
  }),
  createAuditEntry({
    actor: { type: "user", name: "Adi Nugraha" },
    action: "Reassigned lead",
    object: "Lead #442 (Bimo Santoso)",
    before: "Sari Handayani",
    after: "Adi Nugraha",
    timestamp: hoursAgo(6),
  }),
  createAuditEntry({
    actor: { type: "system" },
    action: "SSO config updated",
    object: "Okta IdP",
    before: "Not configured",
    after: "Configured, not enabled",
    timestamp: hoursAgo(20),
  }),
  createAuditEntry({
    actor: { type: "user", name: "Rina Cahyani" },
    action: "Invited member",
    object: "budi@tantira.co",
    after: "Rep, Pending",
    timestamp: hoursAgo(30),
  }),
  createAuditEntry({
    actor: { type: "system" },
    action: "CRM sync failed",
    object: "Lead #418 (Eka Putri)",
    timestamp: hoursAgo(48),
  }),
  createAuditEntry({
    actor: { type: "user", name: "Rina Cahyani" },
    action: "Revoked permission",
    object: "Rep role — Automation: Edit",
    before: "Granted",
    after: "Revoked",
    timestamp: hoursAgo(96),
  }),
  createAuditEntry({
    actor: { type: "system" },
    action: "API key generated",
    object: "CRM Sync Bot",
    timestamp: hoursAgo(240),
  }),
  createAuditEntry({
    actor: { type: "user", name: "Rina Cahyani" },
    action: "Removed member",
    object: "old-contractor@tantira.co",
    before: "Rep, Active",
    after: "Removed",
    timestamp: hoursAgo(400),
  }),
];
