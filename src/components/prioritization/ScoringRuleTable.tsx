import type { ScoringRule } from "../../types";
import { ScoringRuleRow } from "./ScoringRuleRow";

interface ScoringRuleTableProps {
  rules: ScoringRule[];
  onSaveRule: (rule: ScoringRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleStatus: (ruleId: string) => void;
}

export function ScoringRuleTable({ rules, onSaveRule, onDeleteRule, onToggleStatus }: ScoringRuleTableProps) {
  return (
    <div className="scoring-rule-table">
      <div className="scoring-rule-table__header">
        <span>Rule</span>
        <span>Points</span>
        <span>Active</span>
        <span>Actions</span>
      </div>
      {rules.map((rule) => (
        <ScoringRuleRow
          key={rule.id}
          rule={rule}
          onSave={onSaveRule}
          onDelete={() => onDeleteRule(rule.id)}
          onToggleStatus={() => onToggleStatus(rule.id)}
        />
      ))}
    </div>
  );
}
