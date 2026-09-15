import type { CrmConnection } from "../types";

function minutesAgo(n: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d.toISOString();
}

export const INITIAL_CONNECTIONS: CrmConnection[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    status: "healthy",
    lastSyncAt: minutesAgo(0.5),
    pendingCount: 0,
    conflicts: [],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    status: "degraded",
    lastSyncAt: minutesAgo(8),
    pendingCount: 3,
    conflicts: [
      {
        id: "conf-1",
        leadId: "LD-1010",
        leadName: "Kirana Ayu",
        field: "Title",
        crmValue: "Manager",
        tantiraValue: "Director",
      },
      {
        id: "conf-2",
        leadId: "LD-1018",
        leadName: "Salsa Amelia",
        field: "Phone",
        crmValue: "+62 811-2233-4455",
        tantiraValue: "+62 811-2233-9999",
      },
    ],
  },
  {
    id: "monday",
    name: "Monday.com",
    status: "disconnected",
    lastSyncAt: minutesAgo(60 * 48),
    pendingCount: 0,
    conflicts: [],
  },
];
