import { useState } from "react";
import { Button, InputGroup, Switch } from "@blueprintjs/core";
import type { ScoringRule } from "../../types";
import { PointsInput } from "./PointsInput";

interface ScoringRuleRowProps {
  rule: ScoringRule;
  onSave: (rule: ScoringRule) => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export function ScoringRuleRow({ rule, onSave, onDelete, onToggleStatus }: ScoringRuleRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rule);

  function startEdit() {
    setDraft(rule);
    setEditing(true);
  }

  function save() {
    onSave(draft);
    setEditing(false);
  }

  return (
    <div className={`scoring-rule-row${rule.status === "inactive" ? " scoring-rule-row--inactive" : ""}`}>
      {editing ? (
        <InputGroup
          className="scoring-rule-row__description-input"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          autoFocus
        />
      ) : (
        <span className="scoring-rule-row__description">{rule.description}</span>
      )}

      {editing ? (
        <PointsInput value={draft.points} onChange={(points) => setDraft({ ...draft, points })} />
      ) : (
        <span className="points-input" style={{ color: rule.points >= 0 ? "#238551" : "#CD4246" }}>
          <span className="points-input__sign">{rule.points >= 0 ? "+" : "−"}</span>
          {Math.abs(rule.points)}
        </span>
      )}

      <Switch checked={rule.status === "active"} onChange={onToggleStatus} className="scoring-rule-row__status" />

      <div className="scoring-rule-row__actions">
        {editing ? (
          <Button minimal small icon="tick" intent="primary" onClick={save} />
        ) : (
          <Button minimal small icon="edit" onClick={startEdit} />
        )}
        <Button minimal small icon="trash" intent="danger" onClick={onDelete} />
      </div>
    </div>
  );
}
