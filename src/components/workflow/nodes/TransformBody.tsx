import { Button, HTMLSelect, InputGroup } from "@blueprintjs/core";
import { TRANSFORM_SOURCES, TRANSFORM_TYPES, transformPreview, type TransformNode, type TransformType } from "../../../lib/workflowNodes";
import { NodeField } from "./NodeField";

interface Props {
  node: TransformNode;
  onChange: (patch: Partial<TransformNode>) => void;
}

export function TransformBody({ node, onChange }: Props) {
  function updateMapping(index: number, key: "source" | "target", value: string) {
    onChange({ mappings: node.mappings.map((m, i) => (i === index ? { ...m, [key]: value } : m)) });
  }

  return (
    <>
      <NodeField label="Input source" required>
        <HTMLSelect fill value={node.inputSource} onChange={(e) => onChange({ inputSource: e.target.value })}>
          {TRANSFORM_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </HTMLSelect>
      </NodeField>
      <NodeField label="Transform type">
        <HTMLSelect fill value={node.transformType} onChange={(e) => onChange({ transformType: e.target.value as TransformType })}>
          {TRANSFORM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </HTMLSelect>
      </NodeField>

      <div className="wf-node-section-label">Field mapping</div>
      <table className="wf-node-mapping">
        <thead>
          <tr>
            <th>Source field</th>
            <th>Target field</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {node.mappings.map((m, i) => (
            <tr key={i}>
              <td>
                <InputGroup small fill className="wf-node-code" value={m.source} onChange={(e) => updateMapping(i, "source", e.target.value)} />
              </td>
              <td>
                <InputGroup small fill className="wf-node-code" value={m.target} onChange={(e) => updateMapping(i, "target", e.target.value)} />
              </td>
              <td>
                <Button
                  small
                  minimal
                  icon="cross"
                  aria-label="Remove mapping"
                  onClick={() => onChange({ mappings: node.mappings.filter((_, j) => j !== i) })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button small minimal icon="plus" text="Add mapping row" onClick={() => onChange({ mappings: [...node.mappings, { source: "", target: "" }] })} />

      <div className="wf-node-section-label">Output preview (live)</div>
      <pre className="wf-node-preview">{transformPreview(node)}</pre>
    </>
  );
}
