import type { AssignmentRule, ConditionField } from "../types";
import { REPS } from "./reps";

export interface FieldDef {
  key: ConditionField;
  label: string;
  type: "number" | "text" | "select";
  options?: string[];
}

export const FIELD_DEFS: FieldDef[] = [
  { key: "score", label: "Score", type: "number" },
  { key: "priority", label: "Priority", type: "select", options: ["Hot", "Warm", "Cold"] },
  { key: "source", label: "Source", type: "text" },
  { key: "status", label: "Status", type: "select", options: ["New", "Contacted", "Qualified", "Assigned", "Lost"] },
  { key: "company", label: "Company", type: "text" },
];

export interface QueueDef {
  id: string;
  name: string;
}

export const QUEUES: QueueDef[] = [
  { id: "sdr-queue", name: "SDR Queue" },
  { id: "senior-ae-queue", name: "Senior AE Queue" },
];

export const REP_NAMES = REPS.map((r) => r.name);

export const QUEUE_REPS: Record<string, string[]> = {
  "sdr-queue": ["Adi Nugraha", "Rina Marlina"],
  "senior-ae-queue": ["Sari Handayani"],
};

export const INITIAL_ASSIGNMENT_RULES: AssignmentRule[] = [
  {
    id: "rule-1",
    priority: 1,
    conditions: [{ field: "priority", operator: "=", value: "Hot" }],
    conditionLogic: "AND",
    assignTarget: { type: "rep", repId: "Sari Handayani", capacityAware: true },
    status: "active",
    isCatchAll: false,
    lastModifiedBy: "Rina Cahyani",
    lastModifiedAt: new Date().toISOString(),
  },
  {
    id: "rule-2",
    priority: 2,
    conditions: [{ field: "score", operator: ">", value: 70 }],
    conditionLogic: "AND",
    assignTarget: { type: "round_robin", roundRobinGroup: ["Rina Marlina", "Adi Nugraha"], capacityAware: true },
    status: "active",
    isCatchAll: false,
    lastModifiedBy: "Rina Cahyani",
    lastModifiedAt: new Date().toISOString(),
  },
  {
    id: "rule-3",
    priority: 3,
    conditions: [{ field: "source", operator: "=", value: "Referral" }],
    conditionLogic: "AND",
    assignTarget: { type: "queue", queueId: "senior-ae-queue", capacityAware: false },
    status: "inactive",
    isCatchAll: false,
    lastModifiedBy: "Rina Cahyani",
    lastModifiedAt: new Date().toISOString(),
  },
  {
    id: "rule-catchall",
    priority: 999,
    conditions: [],
    conditionLogic: "AND",
    assignTarget: { type: "queue", queueId: "sdr-queue", capacityAware: false },
    status: "active",
    isCatchAll: true,
    lastModifiedBy: "System",
    lastModifiedAt: new Date().toISOString(),
  },
];
