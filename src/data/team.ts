import type { TeamMember } from "../types";

export const INITIAL_TEAM: TeamMember[] = [
  { id: "TM-1", name: "Rina Cahyani", email: "rina@tantira.co", role: "Sales Ops", status: "Active" },
  { id: "TM-2", name: "Rina Marlina", email: "rina.marlina@tantira.co", role: "Rep", status: "Active" },
  { id: "TM-3", name: "Adi Nugraha", email: "adi@tantira.co", role: "Rep", status: "Active" },
  { id: "TM-4", name: "Sari Handayani", email: "sari@tantira.co", role: "Rep", status: "Active" },
  { id: "TM-5", name: "budi@tantira.co", email: "budi@tantira.co", role: "Rep", status: "Pending" },
];

// The signed-in user for this session — used to attribute manual actions in the Audit Log.
export const CURRENT_USER = "Rina Cahyani";
