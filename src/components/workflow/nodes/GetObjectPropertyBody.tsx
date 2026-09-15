import { HTMLSelect, InputGroup } from "@blueprintjs/core";
import { OBJECT_PROPERTIES, SOURCE_OBJECTS, suggestOutputVar, type GetObjectPropertyNode } from "../../../lib/workflowNodes";
import { NodeField } from "./NodeField";

interface Props {
  node: GetObjectPropertyNode;
  onChange: (patch: Partial<GetObjectPropertyNode>) => void;
}

export function GetObjectPropertyBody({ node, onChange }: Props) {
  return (
    <>
      <NodeField label="Source object" required>
        <HTMLSelect fill value={node.source} onChange={(e) => onChange({ source: e.target.value })}>
          {SOURCE_OBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </HTMLSelect>
      </NodeField>
      <NodeField label="Property" required hint="Populated from the selected object's schema.">
        <HTMLSelect
          fill
          value={node.property}
          onChange={(e) => onChange({ property: e.target.value, outputVar: suggestOutputVar(e.target.value) })}
        >
          {OBJECT_PROPERTIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </HTMLSelect>
      </NodeField>
      <NodeField label="Output variable name" hint="Auto-suggested from the property — editable.">
        <InputGroup fill value={node.outputVar} onChange={(e) => onChange({ outputVar: e.target.value })} />
      </NodeField>
    </>
  );
}
