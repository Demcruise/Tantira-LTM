import type { AppNotification } from "../types";

function minutesAgo(n: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d.toISOString();
}

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "N-1",
    title: "New lead needs attention",
    subtitle: "Kirana Ayu",
    time: minutesAgo(2),
    read: false,
    leadId: "LD-1010",
    reason: "ambiguous_match",
  },
  {
    id: "N-2",
    title: "Sync conflict resolved",
    subtitle: "Salsa Amelia",
    time: minutesAgo(60),
    read: true,
    leadId: "LD-1018",
  },
  {
    id: "N-3",
    title: "Rule change applied",
    subtitle: "Assignment Rules — by Rina Cahyani",
    time: minutesAgo(150),
    read: false,
    auditSearch: "assignment rule",
  },
  {
    id: "N-4",
    title: "SSO configuration updated",
    subtitle: "by Admin",
    time: minutesAgo(180),
    read: true,
    auditSearch: "SSO config updated",
  },
  {
    id: "N-5",
    title: "Lead SLA at risk",
    subtitle: "Citra Dewanti",
    time: minutesAgo(240),
    read: false,
    leadId: "LD-1002",
    reason: "sla_at_risk",
  },
  {
    id: "N-6",
    title: "New member invited",
    subtitle: "by Rina Cahyani",
    time: minutesAgo(600),
    read: true,
    auditSearch: "Invited member",
  },
];
