import { useState } from "react";
import { Button, Collapse, HTMLSelect, InputGroup, Tag, TextArea } from "@blueprintjs/core";
import { APPROVED_MODELS, LLM_FORMATS, detectTemplateVariables, type LlmFormat, type UseLlmNode } from "../../../lib/workflowNodes";
import { NodeField } from "./NodeField";
import { VariableInsert } from "./VariableInsert";

interface Props {
  node: UseLlmNode;
  variables: string[];
  onChange: (patch: Partial<UseLlmNode>) => void;
}

export function UseLlmBody({ node, variables, onChange }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const detected = detectTemplateVariables(node.prompt);

  return (
    <>
      <NodeField label="Model" required hint="Org-approved models only — enforced by the platform, not just labeled.">
        <HTMLSelect fill value={node.model} onChange={(e) => onChange({ model: e.target.value })}>
          {APPROVED_MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </HTMLSelect>
      </NodeField>
      <NodeField label="Prompt template" required>
        <TextArea fill autoResize className="wf-node-code" value={node.prompt} onChange={(e) => onChange({ prompt: e.target.value })} />
        <div className="wf-node-row wf-node-row--below">
          <VariableInsert variables={variables} onInsert={(v) => onChange({ prompt: `${node.prompt}{{${v}}}` })} />
        </div>
      </NodeField>
      <div className="wf-node-chips">
        <span className="wf-node-chips__label">Detected input variables:</span>
        {detected.length === 0 ? (
          <span className="wf-node-chips__empty">none — use {"{{variable}}"} syntax</span>
        ) : (
          detected.map((v) => (
            <Tag key={v} minimal icon="variable">
              {v}
            </Tag>
          ))
        )}
      </div>
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
          <NodeField label="Temperature">
            <InputGroup
              type="number"
              value={String(node.temperature)}
              onChange={(e) => onChange({ temperature: Number(e.target.value) })}
            />
          </NodeField>
          <NodeField label="Max tokens">
            <InputGroup type="number" value={String(node.maxTokens)} onChange={(e) => onChange({ maxTokens: Number(e.target.value) })} />
          </NodeField>
          <NodeField label="Format">
            <HTMLSelect value={node.format} onChange={(e) => onChange({ format: e.target.value as LlmFormat })}>
              {LLM_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </HTMLSelect>
          </NodeField>
        </div>
      </Collapse>
    </>
  );
}
