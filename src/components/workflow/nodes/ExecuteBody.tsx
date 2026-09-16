import { useState } from "react";
import { Button, Collapse, HTMLSelect, InputGroup } from "@blueprintjs/core";
import { FUNCTION_DEFS, FUNCTION_NAMES, ON_ERROR_OPTIONS, defaultFunctionInputs, type ExecuteNode, type FunctionName, type OnError } from "../../../lib/workflowNodes";
import { NodeField } from "./NodeField";
import { VariableInsert } from "./VariableInsert";

interface Props {
  node: ExecuteNode;
  variables: string[];
  onChange: (patch: Partial<ExecuteNode>) => void;
}

export function ExecuteBody({ node, variables, onChange }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const def = FUNCTION_DEFS[node.fn];

  return (
    <>
      <NodeField label="Function" required hint="Org-registered custom functions only.">
        <HTMLSelect fill value={node.fn} onChange={(e) => { const fn = e.target.value as FunctionName; onChange({ fn, inputs: defaultFunctionInputs(fn) }); }}>
          {FUNCTION_NAMES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </HTMLSelect>
      </NodeField>

      <div className="wf-node-section-label">Input parameters — per function signature</div>
      {def.inputs.map((input) => (
        <NodeField key={input.key} label={input.key}>
          <div className="wf-node-row">
            <InputGroup
              fill
              className="wf-node-code"
              value={node.inputs[input.key] ?? ""}
              onChange={(e) => onChange({ inputs: { ...node.inputs, [input.key]: e.target.value } })}
            />
            <VariableInsert variables={variables} onInsert={(v) => onChange({ inputs: { ...node.inputs, [input.key]: v } })} />
          </div>
        </NodeField>
      ))}

      <NodeField label="Output variable name">
        <InputGroup fill value={node.outputVar} onChange={(e) => onChange({ outputVar: e.target.value })} />
      </NodeField>

      <Button
        minimal
        small
        className="wf-node-advanced-toggle"
        icon={advancedOpen ? "chevron-down" : "chevron-right"}
        text="Advanced"
        onClick={() => setAdvancedOpen(!advancedOpen)}
      />
      <Collapse isOpen={advancedOpen}>
        <div className="wf-node-advanced">
          <NodeField label="Timeout">
            <InputGroup value={node.timeout} onChange={(e) => onChange({ timeout: e.target.value })} />
          </NodeField>
          <NodeField label="On error">
            <HTMLSelect value={node.onError} onChange={(e) => onChange({ onError: e.target.value as OnError })}>
              {ON_ERROR_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </HTMLSelect>
          </NodeField>
        </div>
      </Collapse>
    </>
  );
}
