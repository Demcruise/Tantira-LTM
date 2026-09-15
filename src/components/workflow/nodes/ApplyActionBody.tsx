import { HTMLSelect, Icon, InputGroup } from "@blueprintjs/core";
import { ACTION_DEFS, ACTION_NAMES, defaultActionParams, type ApplyActionNode } from "../../../lib/workflowNodes";
import { NodeField } from "./NodeField";
import { VariableInsert } from "./VariableInsert";

interface Props {
  node: ApplyActionNode;
  variables: string[];
  onChange: (patch: Partial<ApplyActionNode>) => void;
}

export function ApplyActionBody({ node, variables, onChange }: Props) {
  const def = ACTION_DEFS[node.action];

  return (
    <>
      <NodeField label="Action" required hint="Registered Ontology actions only.">
        <HTMLSelect fill value={node.action} onChange={(e) => onChange({ action: e.target.value, params: defaultActionParams(e.target.value) })}>
          {ACTION_NAMES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </HTMLSelect>
      </NodeField>

      <div className="wf-node-section-label">Parameters — {node.action}</div>
      {def.params.map((p) => (
        <NodeField key={p.key} label={p.label} required={p.required}>
          <div className="wf-node-row">
            <InputGroup
              fill
              className={p.key === "lead" ? "wf-node-code" : undefined}
              value={node.params[p.key] ?? ""}
              onChange={(e) => onChange({ params: { ...node.params, [p.key]: e.target.value } })}
            />
            {p.key === "lead" && <VariableInsert variables={variables} onInsert={(v) => onChange({ params: { ...node.params, lead: v } })} />}
          </div>
        </NodeField>
      ))}

      <div className="wf-node-disclosure wf-node-disclosure--writes">
        <Icon icon="edit" size={12} />
        <span>
          Ontology edits: writes to <strong>{def.writes.join(", ")}</strong>
        </span>
      </div>
    </>
  );
}
