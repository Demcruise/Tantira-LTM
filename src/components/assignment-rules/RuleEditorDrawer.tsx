import { useEffect, useState } from "react";
import { Button, Drawer, H5 } from "@blueprintjs/core";
import type { AssignmentRule } from "../../types";
import { ConditionBuilder } from "./ConditionBuilder";
import { AssignTargetSelector } from "./AssignTargetSelector";
import { SampleLeadTester } from "./SampleLeadTester";
import { REP_NAMES } from "../../data/assignmentRules";

interface RuleEditorDrawerProps {
  isOpen: boolean;
  rule: AssignmentRule | null; // null = creating new rule
  rules: AssignmentRule[];
  onSave: (rule: AssignmentRule) => void;
  onClose: () => void;
}

function blankRule(nextPriority: number): AssignmentRule {
  return {
    id: `rule-${Date.now()}`,
    priority: nextPriority,
    conditions: [{ field: "score", operator: ">", value: 50 }],
    conditionLogic: "AND",
    assignTarget: { type: "rep", repId: REP_NAMES[0], capacityAware: true },
    status: "active",
    isCatchAll: false,
    lastModifiedBy: "",
    lastModifiedAt: "",
  };
}

export function RuleEditorDrawer({ isOpen, rule, rules, onSave, onClose }: RuleEditorDrawerProps) {
  const nonCatchAllCount = rules.filter((r) => !r.isCatchAll).length;
  const [draft, setDraft] = useState<AssignmentRule>(rule ?? blankRule(nonCatchAllCount + 1));

  useEffect(() => {
    if (isOpen) setDraft(rule ?? blankRule(nonCatchAllCount + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, rule]);

  const previewRules = rules.some((r) => r.id === draft.id)
    ? rules.map((r) => (r.id === draft.id ? draft : r))
    : [...rules.filter((r) => !r.isCatchAll), draft, ...rules.filter((r) => r.isCatchAll)];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={rule ? `Edit Rule #${rule.priority}` : "New rule"} size="480px" position="right">
      <div className="rule-editor">
        <div className="rule-editor__section">
          <H5>Conditions</H5>
          <ConditionBuilder
            conditions={draft.conditions}
            logic={draft.conditionLogic}
            onChangeConditions={(conditions) => setDraft({ ...draft, conditions })}
            onChangeLogic={(logic) => setDraft({ ...draft, conditionLogic: logic })}
          />
        </div>

        <div className="rule-editor__section">
          <H5>Assign to</H5>
          <AssignTargetSelector target={draft.assignTarget} onChange={(assignTarget) => setDraft({ ...draft, assignTarget })} />
        </div>

        <div className="rule-editor__section">
          <H5>Test with sample lead</H5>
          <SampleLeadTester rules={previewRules} />
        </div>

        <div className="rule-editor__actions">
          <Button text="Cancel" onClick={onClose} />
          <Button intent="primary" text="Save rule" onClick={() => onSave(draft)} />
        </div>
      </div>
    </Drawer>
  );
}
