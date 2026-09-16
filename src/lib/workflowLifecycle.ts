import { NODE_META, flattenNodes, type WorkflowNode } from "./workflowNodes";

// Single source of truth for the fixed pipeline stage IDs and labels.
// Both dryRun.ts (status lookups) and WorkflowPage.tsx (rendering) import
// these so a stage rename can't silently break the other file.
export const FIXED_STAGE_IDS = {
  trigger: "trigger",
  enrich: "enrich",
  score: "score",
  route: "route",
  assignSenior: "assign-senior",
  assignRoundRobin: "assign-round-robin",
  notify: "notify",
  updateCrm: "update-crm",
} as const;

export const FIXED_STAGE_LABELS: Record<string, string> = {
  [FIXED_STAGE_IDS.trigger]: "New Lead Captured",
  [FIXED_STAGE_IDS.enrich]: "Enrich Lead Data",
  [FIXED_STAGE_IDS.score]: "Compute Lead Score",
  [FIXED_STAGE_IDS.route]: "Route by Priority",
  [FIXED_STAGE_IDS.assignSenior]: "Assign to Senior Rep",
  [FIXED_STAGE_IDS.assignRoundRobin]: "Assign to Round-Robin Queue",
  [FIXED_STAGE_IDS.notify]: "Notify Stakeholders",
  [FIXED_STAGE_IDS.updateCrm]: "Update CRM Status",
};

export interface WorkflowVersion {
  version: number;
  nodes: WorkflowNode[];
  publishedAt: string; // ISO
  publishedBy: string;
  note: string;
}

export interface ValidationIssue {
  nodeId: string;
  label: string;
  message: string;
}

// Static checks a draft must pass before it can be published — independent of any lead.
export function validateWorkflow(nodes: WorkflowNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenVars = new Set<string>();
  for (const node of flattenNodes(nodes)) {
    const label = NODE_META[node.kind].label;
    switch (node.kind) {
      case "create-variable":
        if (!node.name.trim()) issues.push({ nodeId: node.id, label, message: "Variable name is required." });
        else if (seenVars.has(node.name)) issues.push({ nodeId: node.id, label, message: `Variable "${node.name}" is defined twice.` });
        else seenVars.add(node.name);
        if (!node.expression.trim()) issues.push({ nodeId: node.id, label, message: "Value / expression is empty." });
        break;
      case "get-object-property":
        if (!node.outputVar.trim()) issues.push({ nodeId: node.id, label, message: "Output variable name is empty." });
        break;
      case "apply-action":
        // apply-action nodes delegate to the action definition — no local validation needed.
        break;
      case "use-llm":
        if (!node.prompt.trim()) issues.push({ nodeId: node.id, label, message: "Prompt template is empty." });
        if (node.maxTokens <= 0) issues.push({ nodeId: node.id, label, message: "Max tokens must be positive." });
        break;
      case "execute":
        if (!node.fn) issues.push({ nodeId: node.id, label, message: "No function selected." });
        break;
      case "transform":
        if (!node.mappings.some((m) => m.source && m.target)) issues.push({ nodeId: node.id, label, message: "At least one complete field mapping is required." });
        break;
      case "condition":
        if (!node.right.trim()) issues.push({ nodeId: node.id, label, message: "Comparison value is empty." });
        if (node.thenNodes.length === 0 && node.elseNodes.length === 0) issues.push({ nodeId: node.id, label, message: "Both branches are empty — the condition does nothing." });
        break;
      case "wait":
        if (node.hours <= 0) issues.push({ nodeId: node.id, label, message: "Wait duration must be positive." });
        break;
      case "end":
        break;
      default: {
        const _exhaustive: never = node;
        throw new Error(`Unknown node kind: ${_exhaustive}`);
      }
    }
  }
  return issues;
}

export function sameNodes(a: WorkflowNode[], b: WorkflowNode[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// The most recent version published before `currentVersion`, or null if there isn't one.
export function getPreviousVersion(versions: WorkflowVersion[], currentVersion: number): WorkflowVersion | null {
  return versions.filter((v) => v.version < currentVersion).sort((a, b) => b.version - a.version)[0] ?? null;
}
