import type { Lead } from "../types";
import { ACTION_DEFS, NODE_META, detectTemplateVariables, flattenNodes, transformPreview, type ConditionNode, type WorkflowNode } from "./workflowNodes";

function leadValue(lead: Lead, ref: string): string | number | undefined {
  const key = ref.split(".").pop() ?? "";
  const record = lead as unknown as Record<string, unknown>;
  const v = record[key];
  return typeof v === "number" || typeof v === "string" ? v : undefined;
}

function evaluateCondition(node: ConditionNode, lead: Lead): { taken: "then" | "else"; detail: string } | { error: string } {
  const actual = leadValue(lead, node.left);
  if (actual === undefined) return { error: `Cannot read ${node.left} from the lead.` };
  const numeric = typeof actual === "number" && !isNaN(Number(node.right));
  const a = numeric ? (actual as number) : String(actual).toLowerCase();
  const b = numeric ? Number(node.right) : node.right.toLowerCase();
  let result: boolean;
  switch (node.operator) {
    case ">=": result = a >= b; break;
    case ">": result = a > b; break;
    case "<": result = a < b; break;
    case "<=": result = a <= b; break;
    case "=": result = a === b; break;
    case "!=": result = a !== b; break;
  }
  return { taken: result ? "then" : "else", detail: `${node.left} = ${String(actual)} · ${node.operator} ${node.right} is ${result ? "true → Then" : "false → Else"}` };
}

export type NodeStatus = "pass" | "fail" | "skip";

export interface DryRunStep {
  nodeId: string;
  label: string;
  status: NodeStatus;
  detail: string;
}

export interface DryRunResult {
  steps: DryRunStep[];
  statusByNode: Record<string, NodeStatus>;
  stoppedEarly: boolean;
}

function simulateNode(node: WorkflowNode, lead: Lead): { status: NodeStatus; detail: string } {
  switch (node.kind) {
    case "create-variable":
      if (!node.name.trim()) return { status: "fail", detail: "Variable name is required." };
      return { status: "pass", detail: `Set ${node.name} (${node.type}) = ${node.expression || "∅"}` };
    case "get-object-property": {
      const value = node.source === "Trigger.Lead" ? (lead as unknown as Record<string, unknown>)[node.property] : undefined;
      const shown = value === undefined || value === null ? "" : ` = "${String(value)}"`;
      return { status: "pass", detail: `Read ${node.source}.${node.property}${shown} → ${node.outputVar || "(unnamed)"} · no writes` };
    }
    case "use-llm": {
      if (!node.prompt.trim()) return { status: "fail", detail: "Prompt template is empty." };
      const vars = detectTemplateVariables(node.prompt);
      return {
        status: "pass",
        detail: `Simulated call to ${node.model}${vars.length ? ` with ${vars.join(", ")}` : ""} — prompt not sent in test mode`,
      };
    }
    case "apply-action": {
      const writes = ACTION_DEFS[node.action]?.writes ?? [];
      return { status: "pass", detail: `Would run ${node.action} — writes ${writes.join(", ")} (simulated, no write performed)` };
    }
    case "execute":
      if (!node.fn) return { status: "fail", detail: "No function selected." };
      return { status: "pass", detail: `Would call ${node.fn}(${Object.values(node.inputs).join(", ")}) → ${node.outputVar || "(unnamed)"}` };
    case "transform": {
      const valid = node.mappings.filter((m) => m.source && m.target);
      if (valid.length === 0) return { status: "fail", detail: "No field mappings defined." };
      return { status: "pass", detail: `${node.transformType}: ${valid.length} field${valid.length === 1 ? "" : "s"} → ${transformPreview(node).replace(/\s+/g, " ")}` };
    }
    case "wait":
      return { status: "pass", detail: `Would wait ${node.hours}h for ${node.until} — skipped instantly in test mode` };
    case "end":
      return { status: "pass", detail: `Workflow ends here: ${node.result === "complete" ? "Complete" : node.result === "nurture" ? "Send to nurture" : "Drop"}` };
    case "condition":
      return { status: "pass", detail: "" }; // handled by the walker
    default: {
      const _exhaustive: never = node;
      throw new Error(`Unhandled node kind: ${(_exhaustive as WorkflowNode).kind}`);
    }
  }
}

export function runDryRun(lead: Lead, extraNodes: WorkflowNode[] = []): DryRunResult {
  const steps: DryRunStep[] = [];
  const statusByNode: Record<string, NodeStatus> = {};

  function push(nodeId: string, label: string, status: NodeStatus, detail: string) {
    steps.push({ nodeId, label, status, detail });
    statusByNode[nodeId] = status;
  }

  push("trigger", "New Lead Captured", "pass", `Triggered by ${lead.name} (${lead.id})`);

  if (lead.accountMatch === "ambiguous") {
    push("enrich", "Enrich Lead Data", "fail", "Ambiguous account match — needs manual resolution before this workflow can continue.");
    return { steps, statusByNode, stoppedEarly: true };
  }
  push("enrich", "Enrich Lead Data", "pass", `Matched — ${lead.company}`);

  push("score", "Compute Lead Score", "pass", `Score: ${lead.score}/100 → ${lead.priority}`);

  const highPriority = lead.score >= 75;
  push(
    "route",
    "Route by Priority",
    "pass",
    highPriority ? "Compute Lead Score.score ≥ 75 — High priority branch taken" : "Compute Lead Score.score < 75 — Standard priority branch taken",
  );

  if (highPriority) {
    push("assign-senior", "Assign to Senior Rep", "pass", "Would assign to Senior AE pool, 15 minute SLA");
    statusByNode["assign-round-robin"] = "skip";
  } else {
    push("assign-round-robin", "Assign to Round-Robin Queue", "pass", "Would assign to SDR Queue, 4 hour SLA");
    statusByNode["assign-senior"] = "skip";
  }

  push("notify", "Notify Stakeholders", "pass", "Simulated Slack DM — no message sent");

  if (lead.writebackState === "failed") {
    push("update-crm", "Update CRM Status", "fail", "CRM sync is currently failing for this lead — writeback would fail.");
    return { steps, statusByNode, stoppedEarly: true };
  }
  push("update-crm", "Update CRM Status", "pass", "Would set status → Assigned (simulated, no write performed)");

  // Walks the draft tree; returns "stop" when a fail or an End node halts the run.
  function walk(nodes: WorkflowNode[]): "continue" | "stop" {
    for (const node of nodes) {
      if (node.kind === "condition") {
        const result = evaluateCondition(node, lead);
        if ("error" in result) {
          push(node.id, NODE_META.condition.label, "fail", result.error);
          return "stop";
        }
        push(node.id, NODE_META.condition.label, "pass", result.detail);
        const taken = result.taken === "then" ? node.thenNodes : node.elseNodes;
        const skipped = result.taken === "then" ? node.elseNodes : node.thenNodes;
        for (const s of flattenNodes(skipped)) statusByNode[s.id] = "skip";
        if (walk(taken) === "stop") return "stop";
        continue;
      }
      const { status, detail } = simulateNode(node, lead);
      push(node.id, NODE_META[node.kind].label, status, detail);
      if (status === "fail" || node.kind === "end") return "stop";
    }
    return "continue";
  }

  const halted = walk(extraNodes) === "stop";
  const failed = steps.some((s) => s.status === "fail");
  if (halted) {
    // Anything after the halt point that never ran is marked skipped.
    for (const n of flattenNodes(extraNodes)) if (!(n.id in statusByNode)) statusByNode[n.id] = "skip";
  }
  return { steps, statusByNode, stoppedEarly: failed };
}
