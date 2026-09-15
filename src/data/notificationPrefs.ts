import type { NotificationPrefDef, NotificationPrefMatrix } from "../types";

export const NOTIFICATION_EVENTS: NotificationPrefDef[] = [
  { key: "lead.needs_attention", label: "New lead needs attention" },
  { key: "lead.sla_risk", label: "Lead SLA at risk" },
  { key: "sync.conflict", label: "Sync conflict resolved" },
  { key: "sso.config_changed", label: "SSO configuration changed" },
  { key: "team.invited", label: "New member invited" },
  { key: "permission.revoked", label: "Permission revoked" },
];

export const INITIAL_NOTIFICATION_PREFS: NotificationPrefMatrix = {
  "lead.needs_attention": { inApp: true, email: true },
  "lead.sla_risk": { inApp: true, email: false },
  "sync.conflict": { inApp: true, email: false },
  "sso.config_changed": { inApp: true, email: true },
  "team.invited": { inApp: true, email: true },
  "permission.revoked": { inApp: true, email: false },
};
