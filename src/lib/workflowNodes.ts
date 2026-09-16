import type { IconName } from "@blueprintjs/icons";

export type NodeKind = "create-variable" | "get-object-property" | "use-llm" | "apply-action" | "execute" | "transform" | "condition" | "wait" | "end";

export type ConditionOperator = ">=" | ">" | "=" | "!=" | "<" | "<=";
export type EndResult = "complete" | "nurture" | "drop";

export type VariableType = "String" | "Number" | "Boolean" | "Object" | "Array";
export type LlmFormat = "Text" | "JSON";
export type OnError = "Stop workflow" | "Skip step" | "Retry x3";
export type TransformType = "Map" | "Filter" | "Reduce" | "Template";

interface NodeBase {
  id: string;
}

export interface CreateVariableNode extends NodeBase {
  kind: "create-variable";
  name: string;
  type: VariableType;
  expression: string;
}

export interface GetObjectPropertyNode extends NodeBase {
  kind: "get-object-property";
  source: string;
  property: string;
  outputVar: string;
}

export interface UseLlmNode extends NodeBase {
  kind: "use-llm";
  model: string;
  prompt: string;
  outputVar: string;
  temperature: number;
  maxTokens: number;
  format: LlmFormat;
}

export interface ApplyActionNode extends NodeBase {
  kind: "apply-action";
  action: ActionName;
  params: Record<string, string>;
}

export interface ExecuteNode extends NodeBase {
  kind: "execute";
  fn: FunctionName;
  inputs: Record<string, string>;
  outputVar: string;
  timeout: string;
  onError: OnError;
}

export interface FieldMapping {
  source: string;
  target: string;
}

export interface TransformNode extends NodeBase {
  kind: "transform";
  inputSource: string;
  transformType: TransformType;
  mappings: FieldMapping[];
}

export interface ConditionNode extends NodeBase {
  kind: "condition";
  left: string; // lead field reference, e.g. "Compute Lead Score.score"
  operator: ConditionOperator;
  right: string;
  thenNodes: WorkflowNode[];
  elseNodes: WorkflowNode[];
}

export interface WaitNode extends NodeBase {
  kind: "wait";
  hours: number;
  until: string; // what we're waiting for — documentation only
}

export interface EndNode extends NodeBase {
  kind: "end";
  result: EndResult;
}

export type WorkflowNode =
  | CreateVariableNode
  | GetObjectPropertyNode
  | UseLlmNode
  | ApplyActionNode
  | ExecuteNode
  | TransformNode
  | ConditionNode
  | WaitNode
  | EndNode;

export const CONDITION_FIELDS = ["Compute Lead Score.score", "Trigger.Lead.priority", "Trigger.Lead.source", "Trigger.Lead.accountMatch", "Trigger.Lead.status"];
export const CONDITION_OPERATORS: ConditionOperator[] = [">=", ">", "=", "!=", "<", "<="];
export const END_RESULTS: { value: EndResult; label: string; description: string }[] = [
  { value: "complete", label: "Complete", description: "Lead has been fully triaged — hand off to the owner." },
  { value: "nurture", label: "Send to nurture", description: "Not sales-ready yet — start the nurture sequence and stop here." },
  { value: "drop", label: "Drop", description: "Not a real lead — close without assigning." },
];

export interface NodeMeta {
  kind: NodeKind;
  label: string;
  icon: IconName;
  tag: string;
  tagIcon?: IconName;
  description: string;
  example: string;
}

export const NODE_META: Record<NodeKind, NodeMeta> = {
  "create-variable": {
    kind: "create-variable",
    label: "Save a Value",
    icon: "variable",
    tag: "No writes",
    description: "Store a value to reference later in this workflow.",
    example: "e.g. capture Trigger.Lead.score once, reuse it in later steps without recomputing.",
  },
  "get-object-property": {
    kind: "get-object-property",
    label: "Read a Field",
    icon: "database",
    tag: "Read-only",
    tagIcon: "eye-open",
    description: "Read a field off the lead or a previous step — no writes.",
    example: "e.g. read Lead.company to pass into the enrichment step.",
  },
  "use-llm": {
    kind: "use-llm",
    label: "Ask AI",
    icon: "chat",
    tag: "AI step",
    tagIcon: "predictive-analysis",
    description: "Send a prompt to a model and use its response as a step output.",
    example: "e.g. summarize a lead's activity timeline into a one-line note for the rep.",
  },
  "apply-action": {
    kind: "apply-action",
    label: "Take Action",
    icon: "flash",
    tag: "Writes data",
    tagIcon: "edit",
    description: "Run a registered action — e.g. assign, update status.",
    example: "e.g. Assign Lead or Update Lead Status, as used later in this canvas.",
  },
  execute: {
    kind: "execute",
    label: "Run a Function",
    icon: "function",
    tag: "Custom function",
    tagIcon: "code",
    description: "Run a custom function against the current step's inputs.",
    example: "e.g. a territory-match function that isn't covered by the standard rule engine.",
  },
  transform: {
    kind: "transform",
    label: "Reshape Data",
    icon: "exchange",
    tag: "Data mapping",
    tagIcon: "flow-review",
    description: "Reshape or map data between steps.",
    example: "e.g. map a raw webhook payload into the fields an action expects.",
  },
  condition: {
    kind: "condition",
    label: "Condition",
    icon: "flow-branch",
    tag: "Branch",
    tagIcon: "fork",
    description: "Split the flow: leads that match go down the Then branch, everything else goes down Else.",
    example: "e.g. score ≥ 75 → assign to a senior rep, otherwise → send to nurture.",
  },
  wait: {
    kind: "wait",
    label: "Wait",
    icon: "time",
    tag: "Timer",
    tagIcon: "stopwatch",
    description: "Pause the flow for a period before the next step runs.",
    example: "e.g. wait 24h for a reply before escalating.",
  },
  end: {
    kind: "end",
    label: "End",
    icon: "stop",
    tag: "Terminal",
    tagIcon: "flag",
    description: "Stop the flow here with an explicit result.",
    example: "e.g. end as “Send to nurture” on the Else branch so nothing downstream runs.",
  },
};

export const NODE_KINDS: NodeKind[] = ["create-variable", "get-object-property", "use-llm", "apply-action", "execute", "transform", "condition", "wait", "end"];

export const VARIABLE_TYPES: VariableType[] = ["String", "Number", "Boolean", "Object", "Array"];
export const LLM_FORMATS: LlmFormat[] = ["Text", "JSON"];
export const ON_ERROR_OPTIONS: OnError[] = ["Stop workflow", "Skip step", "Retry x3"];
export const TRANSFORM_TYPES: TransformType[] = ["Map", "Filter", "Reduce", "Template"];

export const SOURCE_OBJECTS = ["Trigger.Lead", "Enrich Lead Data.Output", "Compute Lead Score.Output"];
export const TRANSFORM_SOURCES = ["Trigger.RawWebhookPayload", "Trigger.Lead", "Enrich Lead Data.Output"];
export const OBJECT_PROPERTIES = ["company", "email", "score", "source", "priority", "status", "assignedTo"];

export const APPROVED_MODELS = ["GPT-4 (org default)", "Claude Sonnet 5", "Claude Haiku 4.5", "Llama 4 Maverick (self-hosted)"];

export interface ActionParamDef {
  key: string;
  label: string;
  required?: boolean;
  defaultValue: string;
}

export interface ActionDef {
  params: ActionParamDef[];
  writes: string[];
}

const LEAD_PARAM: ActionParamDef = { key: "lead", label: "Lead", required: true, defaultValue: "Trigger.Lead" };

export const ACTION_DEFS = {
  "Enrich Lead": {
    params: [LEAD_PARAM, { key: "source", label: "Enrichment Source", defaultValue: "Clearbit API" }],
    writes: ["Lead.company", "Lead.accountMatch"],
  },
  "Prioritize Lead": {
    params: [LEAD_PARAM, { key: "model", label: "Prioritization Model", defaultValue: "v3 — Firmographic + Engagement" }],
    writes: ["Lead.score", "Lead.priority"],
  },
  "Assign Lead": {
    params: [LEAD_PARAM, { key: "ruleSet", label: "Assignment Rule Set", defaultValue: "Default Assignment Rules" }],
    writes: ["Lead.assignedRepId", "Lead.assignmentReason"],
  },
  "Update Sync Status": {
    params: [LEAD_PARAM, { key: "status", label: "Status", defaultValue: "Assigned" }],
    writes: ["Lead.writebackState", "Lead.syncedAt"],
  },
  "Log Outcome": {
    params: [LEAD_PARAM, { key: "outcome", label: "Outcome", defaultValue: "Won" }],
    writes: ["Lead.outcome"],
  },
} satisfies Record<string, ActionDef>;

export type ActionName = keyof typeof ACTION_DEFS;

export const ACTION_NAMES = Object.keys(ACTION_DEFS) as ActionName[];

export interface FunctionDef {
  inputs: { key: string; defaultValue: string }[];
}

export const FUNCTION_DEFS = {
  calculateTerritoryMatch: {
    inputs: [
      { key: "leadRegion", defaultValue: "Trigger.Lead.region" },
      { key: "repTerritory", defaultValue: "Trigger.Rep.territory" },
    ],
  },
  dedupeByEmail: { inputs: [{ key: "email", defaultValue: "Trigger.Lead.email" }] },
  computeEngagementScore: {
    inputs: [
      { key: "lastActivity", defaultValue: "Trigger.Lead.lastActivity" },
      { key: "source", defaultValue: "Trigger.Lead.source" },
    ],
  },
} satisfies Record<string, FunctionDef>;

export type FunctionName = keyof typeof FUNCTION_DEFS;

export const FUNCTION_NAMES = Object.keys(FUNCTION_DEFS) as FunctionName[];

export function defaultActionParams(action: ActionName): Record<string, string> {
  return Object.fromEntries(ACTION_DEFS[action].params.map((p) => [p.key, p.defaultValue]));
}

export function defaultFunctionInputs(fn: FunctionName): Record<string, string> {
  return Object.fromEntries(FUNCTION_DEFS[fn].inputs.map((i) => [i.key, i.defaultValue]));
}

let counter = 0;

export function createNode(kind: NodeKind): WorkflowNode {
  counter += 1;
  const id = `node-${Date.now()}-${counter}`;
  switch (kind) {
    case "create-variable":
      return { id, kind, name: "leadScoreCache", type: "Number", expression: "Trigger.Lead.score" };
    case "get-object-property":
      return { id, kind, source: "Trigger.Lead", property: "company", outputVar: "leadCompany" };
    case "use-llm":
      return {
        id,
        kind,
        model: APPROVED_MODELS[0],
        prompt: "Summarize {{leadCompany}}'s activity timeline into a one-line note for the rep.",
        outputVar: "repNoteSummary",
        temperature: 0.3,
        maxTokens: 200,
        format: "Text",
      };
    case "apply-action":
      return { id, kind, action: "Assign Lead", params: defaultActionParams("Assign Lead") };
    case "execute":
      return {
        id,
        kind,
        fn: "calculateTerritoryMatch",
        inputs: defaultFunctionInputs("calculateTerritoryMatch"),
        outputVar: "territoryMatchResult",
        timeout: "30s",
        onError: "Stop workflow",
      };
    case "transform":
      return {
        id,
        kind,
        inputSource: "Trigger.RawWebhookPayload",
        transformType: "Map",
        mappings: [
          { source: "contact_email", target: "email" },
          { source: "biz_name", target: "company" },
        ],
      };
    case "condition":
      return { id, kind, left: "Compute Lead Score.score", operator: ">=", right: "75", thenNodes: [], elseNodes: [] };
    case "wait":
      return { id, kind, hours: 24, until: "a reply from the lead" };
    case "end":
      return { id, kind, result: "complete" };
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unhandled node kind: ${_exhaustive}`);
    }
  }
}

// --- Tree helpers: nodes can nest inside condition branches ---

export function flattenNodes(nodes: WorkflowNode[]): WorkflowNode[] {
  return nodes.flatMap((n) => (n.kind === "condition" ? [n, ...flattenNodes(n.thenNodes), ...flattenNodes(n.elseNodes)] : [n]));
}

export function updateNodeDeep(nodes: WorkflowNode[], id: string, next: WorkflowNode): WorkflowNode[] {
  return nodes.map((n) => {
    if (n.id === id) return next;
    if (n.kind === "condition") return { ...n, thenNodes: updateNodeDeep(n.thenNodes, id, next), elseNodes: updateNodeDeep(n.elseNodes, id, next) };
    return n;
  });
}

export function removeNodeDeep(nodes: WorkflowNode[], id: string): WorkflowNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => (n.kind === "condition" ? { ...n, thenNodes: removeNodeDeep(n.thenNodes, id), elseNodes: removeNodeDeep(n.elseNodes, id) } : n));
}

export function addToBranch(nodes: WorkflowNode[], conditionId: string, branch: "then" | "else", node: WorkflowNode): WorkflowNode[] {
  return nodes.map((n) => {
    if (n.kind !== "condition") return n;
    if (n.id === conditionId) return branch === "then" ? { ...n, thenNodes: [...n.thenNodes, node] } : { ...n, elseNodes: [...n.elseNodes, node] };
    return { ...n, thenNodes: addToBranch(n.thenNodes, conditionId, branch, node), elseNodes: addToBranch(n.elseNodes, conditionId, branch, node) };
  });
}

export function outputVarOf(node: WorkflowNode): string | null {
  switch (node.kind) {
    case "create-variable":
      return node.name || null;
    case "get-object-property":
    case "use-llm":
    case "execute":
      return node.outputVar || null;
    default:
      return null;
  }
}

export const BASE_VARIABLES = [
  "Trigger.Lead",
  "Trigger.Lead.score",
  "Trigger.Lead.company",
  "Trigger.Lead.email",
  "Trigger.Lead.source",
  "Trigger.Lead.priority",
  "Enrich Lead Data.Output",
  "Compute Lead Score.Output",
  "Compute Lead Score.score",
];

// Variables visible to a node: everything that appears before it in a depth-first walk.
export function variablesBefore(nodes: WorkflowNode[], nodeId: string): string[] {
  const flat = flattenNodes(nodes);
  const index = flat.findIndex((n) => n.id === nodeId);
  const upstream = index === -1 ? flat : flat.slice(0, index);
  const fromNodes = upstream.map(outputVarOf).filter((v): v is string => v !== null);
  return [...BASE_VARIABLES, ...fromNodes];
}

export function detectTemplateVariables(prompt: string): string[] {
  const found = new Set<string>();
  for (const match of prompt.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)) found.add(match[1]);
  return [...found];
}

export function suggestOutputVar(property: string): string {
  return property ? `lead${property.charAt(0).toUpperCase()}${property.slice(1)}` : "";
}

export function transformPreview(node: TransformNode): string {
  const obj = Object.fromEntries(node.mappings.filter((m) => m.target).map((m) => [m.target, "..."]));
  return JSON.stringify(obj, null, 2);
}
