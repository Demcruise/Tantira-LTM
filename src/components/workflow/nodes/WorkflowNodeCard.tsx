import { Icon } from "@blueprintjs/core";
import { NODE_META, variablesBefore, type NodeKind, type WorkflowNode } from "../../../lib/workflowNodes";
import type { NodeStatus } from "../../../lib/dryRun";
import { BlockShell } from "../BlockShell";
import { CreateVariableBody } from "./CreateVariableBody";
import { GetObjectPropertyBody } from "./GetObjectPropertyBody";
import { UseLlmBody } from "./UseLlmBody";
import { ApplyActionBody } from "./ApplyActionBody";
import { ExecuteBody } from "./ExecuteBody";
import { TransformBody } from "./TransformBody";
import { ConditionBody } from "./ConditionBody";
import { EndBody, WaitBody } from "./WaitEndBodies";
import { AddBlockMenu } from "./AddBlockMenu";

export interface NodeTreeCallbacks {
  rootNodes: WorkflowNode[];
  statusByNode: Record<string, NodeStatus>;
  detailFor: (nodeId: string) => string | undefined;
  onChange: (next: WorkflowNode) => void;
  onRemove: (nodeId: string) => void;
  onAddToBranch: (conditionId: string, branch: "then" | "else", kind: NodeKind) => void;
}

interface WorkflowNodeCardProps extends NodeTreeCallbacks {
  node: WorkflowNode;
  nested?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function WorkflowNodeCard(props: WorkflowNodeCardProps) {
  const { node, nested, onMoveUp, onMoveDown, rootNodes, statusByNode, detailFor, onChange, onRemove, onAddToBranch } = props;
  const meta = NODE_META[node.kind];
  const variables = variablesBefore(rootNodes, node.id);
  const status = statusByNode[node.id];
  const patch = (p: Partial<WorkflowNode>) => onChange({ ...node, ...p } as WorkflowNode);

  function renderBranch(nodes: WorkflowNode[], conditionId: string, branch: "then" | "else") {
    return (
      <div className="wf-branch">
        {nodes.map((child) => (
          <div key={child.id} className="wf-branch__item">
            <WorkflowNodeCard {...props} node={child} nested onMoveUp={undefined} onMoveDown={undefined} />
          </div>
        ))}
        <AddBlockMenu onAdd={(kind) => onAddToBranch(conditionId, branch, kind)} label={nodes.length === 0 ? "Add a step to this branch" : "Add step"} />
      </div>
    );
  }

  function body() {
    switch (node.kind) {
      case "create-variable":
        return <CreateVariableBody node={node} variables={variables} onChange={patch} />;
      case "get-object-property":
        return <GetObjectPropertyBody node={node} onChange={patch} />;
      case "use-llm":
        return <UseLlmBody node={node} variables={variables} onChange={patch} />;
      case "apply-action":
        return <ApplyActionBody node={node} variables={variables} onChange={patch} />;
      case "execute":
        return <ExecuteBody node={node} variables={variables} onChange={patch} />;
      case "transform":
        return <TransformBody node={node} onChange={patch} />;
      case "wait":
        return <WaitBody node={node} onChange={patch} />;
      case "end":
        return <EndBody node={node} onChange={patch} />;
      case "condition": {
        const detail = detailFor(node.id) ?? "";
        const branchTaken = status === "pass" ? (detail.includes("→ Then") ? "then" : detail.includes("→ Else") ? "else" : undefined) : undefined;
        return (
          <ConditionBody
            node={node}
            onChange={patch}
            branchTaken={branchTaken}
            thenChildren={renderBranch(node.thenNodes, node.id, "then")}
            elseChildren={renderBranch(node.elseNodes, node.id, "else")}
          />
        );
      }
    }
  }

  const tone = node.kind === "condition" ? "conditional" : node.kind === "end" || node.kind === "wait" ? "loop" : "action";

  return (
    <BlockShell
      tone={tone}
      icon={meta.icon}
      typeLabel="Step"
      name={meta.label}
      tagIcon={meta.tagIcon}
      tagLabel={meta.tag}
      nested={nested}
      outputLabel={["apply-action", "transform", "condition", "wait", "end"].includes(node.kind) ? undefined : "Output"}
      dryRunStatus={status}
      dryRunDetail={detailFor(node.id)}
      onRemove={() => onRemove(node.id)}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    >
      {body()}
      {node.kind === "get-object-property" && (
        <div className="wf-node-disclosure">
          <Icon icon="eye-open" size={12} />
          <span>Read-only — this step never writes to the Ontology.</span>
        </div>
      )}
    </BlockShell>
  );
}
