import { Button, HTMLSelect, InputGroup } from "@blueprintjs/core";
import { FIELD_DEFS } from "../../data/assignmentRules";
import type { Condition, ConditionField, ConditionOperator } from "../../types";

const OPERATORS: ConditionOperator[] = [">", "<", "=", "!=", "contains"];

function findFieldDef(key: ConditionField) {
  const def = FIELD_DEFS.find((f) => f.key === key);
  if (!def) throw new Error(`Unknown condition field: ${key}`);
  return def;
}

interface ConditionRowProps {
  condition: Condition;
  onChange: (next: Condition) => void;
  onRemove: () => void;
}

export function ConditionRow({ condition, onChange, onRemove }: ConditionRowProps) {
  const fieldDef = findFieldDef(condition.field);

  return (
    <div className="condition-row">
      <HTMLSelect
        value={condition.field}
        onChange={(e) => {
          const nextField = e.target.value as ConditionField;
          const nextDef = findFieldDef(nextField);
          onChange({ ...condition, field: nextField, value: nextDef.options?.[0] ?? "" });
        }}
      >
        {FIELD_DEFS.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </HTMLSelect>

      <HTMLSelect value={condition.operator} onChange={(e) => onChange({ ...condition, operator: e.target.value as ConditionOperator })}>
        {OPERATORS.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </HTMLSelect>

      {fieldDef.type === "select" ? (
        <HTMLSelect value={String(condition.value)} onChange={(e) => onChange({ ...condition, value: e.target.value })}>
          {fieldDef.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </HTMLSelect>
      ) : (
        <InputGroup
          type={fieldDef.type === "number" ? "number" : "text"}
          value={String(condition.value)}
          onChange={(e) =>
            onChange({ ...condition, value: fieldDef.type === "number" ? Number(e.target.value) : e.target.value })
          }
        />
      )}

      <Button minimal icon="cross" onClick={onRemove} />
    </div>
  );
}
