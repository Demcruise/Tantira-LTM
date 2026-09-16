import type { NotificationPrefDef, NotificationPrefMatrix } from "../types";

export const NOTIFICATION_EVENTS: NotificationPrefDef[] = [
  { key: "lead.needs_attention", label: "New lead needs attention", description: "A lead entered the Attention Center queue." },
  { key: "lead.sla_risk", label: "Lead SLA at risk", description: "A lead is approaching or past its response deadline." },
  { key: "sync.conflict", label: "Sync conflict resolved", description: "A CRM sync conflict was resolved or escalated." },
  { key: "sso.config_changed", label: "SSO configuration changed", description: "Identity provider or attribute mapping was updated." },
  { key: "team.invited", label: "New member invited", description: "A team member invite was sent or resent." },
  { key: "permission.revoked", label: "Permission revoked", description: "A role or API key was revoked." },
];

export const INITIAL_NOTIFICATION_PREFS: NotificationPrefMatrix = {
  "lead.needs_attention": { inApp: true, email: true },
  "lead.sla_risk": { inApp: true, email: false },
  "sync.conflict": { inApp: true, email: false },
  "sso.config_changed": { inApp: true, email: true },
  "team.invited": { inApp: true, email: true },
  "permission.revoked": { inApp: true, email: false },
};
