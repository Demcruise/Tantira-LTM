import { InputGroup, Radio, RadioGroup } from "@blueprintjs/core";
import { END_RESULTS, type EndNode, type EndResult, type WaitNode } from "../../../lib/workflowNodes";
import { NodeField } from "./NodeField";

export function WaitBody({ node, onChange }: { node: WaitNode; onChange: (patch: Partial<WaitNode>) => void }) {
  return (
    <>
      <NodeField label="Duration (hours)" required>
        <InputGroup type="number" value={String(node.hours)} onChange={(e) => onChange({ hours: Number(e.target.value) })} />
      </NodeField>
      <NodeField label="Waiting for" hint="Documentation only — shown in the execution trace.">
        <InputGroup fill value={node.until} onChange={(e) => onChange({ until: e.target.value })} />
      </NodeField>
    </>
  );
}

export function EndBody({ node, onChange }: { node: EndNode; onChange: (patch: Partial<EndNode>) => void }) {
  return (
    <NodeField label="Result" required hint="Nothing after this step runs for the lead.">
      <RadioGroup selectedValue={node.result} onChange={(e) => onChange({ result: e.currentTarget.value as EndResult })}>
        {END_RESULTS.map((r) => (
          <Radio key={r.value} value={r.value} labelElement={<span>{r.label} <span className="wf-node-hint">— {r.description}</span></span>} />
        ))}
      </RadioGroup>
    </NodeField>
  );
}
