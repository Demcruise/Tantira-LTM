import type { ReactNode } from "react";
import { HTMLSelect, InputGroup } from "@blueprintjs/core";
import { CONDITION_FIELDS, CONDITION_OPERATORS, friendlyLabel, type ConditionNode, type ConditionOperator } from "../../../lib/workflowNodes";

interface Props {
  node: ConditionNode;
  onChange: (patch: Partial<ConditionNode>) => void;
  thenChildren: ReactNode;
  elseChildren: ReactNode;
  branchTaken?: "then" | "else";
}

export function ConditionBody({ node, onChange, thenChildren, elseChildren, branchTaken }: Props) {
  return (
    <>
      <div className="wf-cond__section-label">When</div>
      <div className="wf-cond__editor">
        <HTMLSelect value={node.left} onChange={(e) => onChange({ left: e.target.value })}>
          {CONDITION_FIELDS.map((f) => (
            <option key={f} value={f}>
              {friendlyLabel(f)}
            </option>
          ))}
        </HTMLSelect>
        <HTMLSelect value={node.operator} onChange={(e) => onChange({ operator: e.target.value as ConditionOperator })}>
          {CONDITION_OPERATORS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </HTMLSelect>
        <InputGroup className="wf-node-code wf-cond__value" value={node.right} placeholder="value" onChange={(e) => onChange({ right: e.target.value })} />
      </div>

      <div className={`wf-cond__branch${branchTaken === "else" ? " wf-cond__branch--skipped" : branchTaken === "then" ? " wf-cond__branch--taken" : ""}`}>
        <div className="wf-cond__section-label">Then</div>
        <div className="wf-cond__nested">{thenChildren}</div>
      </div>

      <div className={`wf-cond__branch${branchTaken === "then" ? " wf-cond__branch--skipped" : branchTaken === "else" ? " wf-cond__branch--taken" : ""}`}>
        <div className="wf-cond__section-label">Else</div>
        <div className="wf-cond__nested">{elseChildren}</div>
      </div>
    </>
  );
}
