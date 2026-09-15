import { Button, Icon, Switch, Tag } from "@blueprintjs/core";
import type { AssignmentRule } from "../../types";
import { summarizeConditions, summarizeTarget } from "../../lib/ruleEngine";

interface RuleRowProps {
  rule: AssignmentRule;
  matchCount: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  dragHandlers: {
    draggable: boolean;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
  };
}

export function RuleRow({ rule, matchCount, onEdit, onDuplicate, onDelete, onToggleStatus, dragHandlers }: RuleRowProps) {
  return (
    <div
      className={`rule-row${rule.status === "inactive" ? " rule-row--inactive" : ""}`}
      draggable={dragHandlers.draggable}
      onDragStart={dragHandlers.onDragStart}
      onDragOver={dragHandlers.onDragOver}
      onDrop={dragHandlers.onDrop}
    >
      <span className="rule-row__handle" title="Drag to reorder">
        <Icon icon="drag-handle-vertical" size={14} />
      </span>

      <span className="rule-row__priority">#{rule.priority}</span>

      <div className="rule-row__summary">
        <div className="rule-row__condition">{summarizeConditions(rule.conditions, rule.conditionLogic)}</div>
        <div className="rule-row__tags">
          <Tag minimal icon="send-to" className="rule-row__target">
            {summarizeTarget(rule.assignTarget)}
          </Tag>
          <Tag minimal round intent={matchCount > 0 ? "primary" : "none"} title="Open leads whose first matching active rule is this one">
            {matchCount} open lead{matchCount === 1 ? "" : "s"} match
          </Tag>
        </div>
      </div>

      <Switch
        checked={rule.status === "active"}
        label={rule.status === "active" ? "Active" : "Inactive"}
        onChange={onToggleStatus}
        className="rule-row__status"
      />

      <div className="rule-row__actions">
        <Button minimal small icon="edit" onClick={onEdit} />
        <Button minimal small icon="duplicate" onClick={onDuplicate} />
        <Button minimal small icon="trash" intent="danger" onClick={onDelete} />
      </div>
    </div>
  );
}
