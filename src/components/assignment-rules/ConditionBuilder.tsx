import { Button, HTMLSelect } from "@blueprintjs/core";
import { ConditionRow } from "./ConditionRow";
import type { Condition } from "../../types";

interface ConditionBuilderProps {
  conditions: Condition[];
  logic: "AND" | "OR";
  onChangeConditions: (conditions: Condition[]) => void;
  onChangeLogic: (logic: "AND" | "OR") => void;
}

export function ConditionBuilder({ conditions, logic, onChangeConditions, onChangeLogic }: ConditionBuilderProps) {
  function updateAt(i: number, next: Condition) {
    onChangeConditions(conditions.map((c, idx) => (idx === i ? next : c)));
  }

  function removeAt(i: number) {
    onChangeConditions(conditions.filter((_, idx) => idx !== i));
  }

  function addCondition() {
    onChangeConditions([...conditions, { field: "score", operator: ">", value: 0 }]);
  }

  return (
    <div className="condition-builder">
      {conditions.length > 1 && (
        <div className="condition-builder__logic">
          <span>Match</span>
          <HTMLSelect minimal value={logic} onChange={(e) => onChangeLogic(e.target.value as "AND" | "OR")}>
            <option value="AND">ALL</option>
            <option value="OR">ANY</option>
          </HTMLSelect>
          <span>of the following</span>
        </div>
      )}

      {conditions.length === 0 && <p className="condition-builder__empty">No conditions — this rule matches every lead.</p>}

      {conditions.map((c, i) => (
        <ConditionRow key={i} condition={c} onChange={(next) => updateAt(i, next)} onRemove={() => removeAt(i)} />
      ))}

      <Button minimal icon="add" text="Add condition" onClick={addCondition} />
    </div>
  );
}
