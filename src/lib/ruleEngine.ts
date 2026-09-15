import type { AssignmentRule, AssignTarget, Condition, Lead, SampleLeadInput } from "../types";
import { QUEUES, QUEUE_REPS } from "../data/assignmentRules";
import { REPS } from "../data/reps";

export function leadToSample(lead: Lead): SampleLeadInput {
  return { score: lead.score, priority: lead.priority, source: lead.source, status: lead.status, company: lead.company };
}

export interface AssignmentPlan {
  leadId: string;
  assignee: string;
  ruleId: string;
}

// Runs the active rule chain over `targets`, picking the least-loaded rep in the
// rule's pool. Capacity-aware rules skip reps that are already full; if nobody in
// the pool has room the lead stays unassigned rather than overloading someone.
export function assignByRules(allLeads: Lead[], rules: AssignmentRule[], targets: Lead[]): AssignmentPlan[] {
  const load = new Map<string, number>(REPS.map((r) => [r.name, allLeads.filter((l) => l.status !== "Lost" && l.assignedTo === r.name).length]));
  const capacity = new Map<string, number>(REPS.map((r) => [r.name, r.capacity]));
  const plan: AssignmentPlan[] = [];

  for (const lead of targets) {
    const rule = findMatchingRule(leadToSample(lead), rules);
    if (!rule) continue;
    const t = rule.assignTarget;
    const pool = t.type === "rep" && t.repId ? [t.repId] : t.type === "queue" && t.queueId ? (QUEUE_REPS[t.queueId] ?? []) : (t.roundRobinGroup ?? []);
    const eligible = pool.filter((rep) => !t.capacityAware || (load.get(rep) ?? 0) < (capacity.get(rep) ?? 0));
    if (eligible.length === 0) continue;
    const assignee = eligible.reduce((best, rep) => ((load.get(rep) ?? 0) < (load.get(best) ?? 0) ? rep : best), eligible[0]);
    load.set(assignee, (load.get(assignee) ?? 0) + 1);
    plan.push({ leadId: lead.id, assignee, ruleId: rule.id });
  }
  return plan;
}

function evalCondition(sample: SampleLeadInput, cond: Condition): boolean {
  const fieldValue = sample[cond.field];

  if (cond.operator === "contains") {
    return String(fieldValue).toLowerCase().includes(String(cond.value).toLowerCase());
  }

  const numeric = typeof fieldValue === "number" && typeof cond.value !== "boolean";
  if (numeric && !isNaN(Number(cond.value))) {
    const a = fieldValue as number;
    const b = Number(cond.value);
    switch (cond.operator) {
      case ">":
        return a > b;
      case "<":
        return a < b;
      case "=":
        return a === b;
      case "!=":
        return a !== b;
    }
  }

  const a = String(fieldValue).toLowerCase();
  const b = String(cond.value).toLowerCase();
  switch (cond.operator) {
    case "=":
      return a === b;
    case "!=":
      return a !== b;
    default:
      return false;
  }
}

export function conditionsMatch(sample: SampleLeadInput, conditions: Condition[], logic: "AND" | "OR"): boolean {
  if (conditions.length === 0) return true; // catch-all
  if (logic === "AND") return conditions.every((c) => evalCondition(sample, c));
  return conditions.some((c) => evalCondition(sample, c));
}

export function findMatchingRule(sample: SampleLeadInput, rules: AssignmentRule[]): AssignmentRule | null {
  const active = rules.filter((r) => r.status === "active").sort((a, b) => a.priority - b.priority);
  for (const rule of active) {
    if (conditionsMatch(sample, rule.conditions, rule.conditionLogic)) return rule;
  }
  return null;
}

const OPERATOR_LABEL: Record<Condition["operator"], string> = {
  ">": ">",
  "<": "<",
  "=": "=",
  "!=": "≠",
  contains: "contains",
};

const FIELD_LABEL: Record<Condition["field"], string> = {
  score: "Prioritization Score",
  priority: "Priority",
  source: "Source",
  status: "Status",
  company: "Company",
};

export function summarizeConditions(conditions: Condition[], logic: "AND" | "OR"): string {
  if (conditions.length === 0) return "Always (catch-all)";
  return conditions
    .map((c) => `${FIELD_LABEL[c.field]} ${OPERATOR_LABEL[c.operator]} ${c.value}`)
    .join(` ${logic} `);
}

export function summarizeTarget(target: AssignTarget): string {
  if (target.type === "rep") return target.repId ?? "Unassigned rep";
  if (target.type === "queue") return QUEUES.find((q) => q.id === target.queueId)?.name ?? "Unknown queue";
  return `Round-robin: ${target.roundRobinGroup?.join(", ") ?? "No reps"}`;
}
