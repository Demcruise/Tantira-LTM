import { HTMLSelect, Icon, InputGroup } from "@blueprintjs/core";
import { ACTION_DEFS, ACTION_NAMES, defaultActionParams, type ActionName, type ApplyActionNode } from "../../../lib/workflowNodes";
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
      <NodeField label="Action" required hint="Actions your team has registered.">
        <HTMLSelect fill value={node.action} onChange={(e) => { const action = e.target.value as ActionName; onChange({ action, params: defaultActionParams(action) }); }}>
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
          Writes to: <strong>{def.writes.join(", ")}</strong>
        </span>
      </div>
    </>
  );
}
