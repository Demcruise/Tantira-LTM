import { HTMLSelect, InputGroup } from "@blueprintjs/core";
import { VARIABLE_TYPES, type CreateVariableNode, type VariableType } from "../../../lib/workflowNodes";
import { NodeField } from "./NodeField";
import { VariableInsert } from "./VariableInsert";

interface Props {
  node: CreateVariableNode;
  variables: string[];
  onChange: (patch: Partial<CreateVariableNode>) => void;
}

export function CreateVariableBody({ node, variables, onChange }: Props) {
  return (
    <>
      <NodeField label="Variable name" required>
        <InputGroup fill value={node.name} placeholder="leadScoreCache" onChange={(e) => onChange({ name: e.target.value })} />
      </NodeField>
      <NodeField label="Type">
        <HTMLSelect fill value={node.type} onChange={(e) => onChange({ type: e.target.value as VariableType })}>
          {VARIABLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </HTMLSelect>
      </NodeField>
      <NodeField label="Value / Expression" required hint="Reference a value from a previous step.">
        <div className="wf-node-row">
          <InputGroup
            fill
            className="wf-node-code"
            value={node.expression}
            placeholder="Lead score"
            onChange={(e) => onChange({ expression: e.target.value })}
          />
          <VariableInsert variables={variables} onInsert={(v) => onChange({ expression: v })} />
        </div>
      </NodeField>
    </>
  );
}
