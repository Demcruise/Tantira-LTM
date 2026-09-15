import { Icon, Tag, Tooltip } from "@blueprintjs/core";
import type { AssignmentRule } from "../../types";
import { summarizeTarget } from "../../lib/ruleEngine";

export function CatchAllRuleCard({ rule, onEdit }: { rule: AssignmentRule; onEdit: () => void }) {
  return (
    <div className="catch-all-card" onClick={onEdit}>
      <Tooltip content="This rule ensures no lead is left unassigned.">
        <span className="catch-all-card__lock">
          <Icon icon="lock" size={13} />
        </span>
      </Tooltip>
      <div className="catch-all-card__summary">
        <div className="catch-all-card__label">Catch-all rule</div>
        <div className="catch-all-card__desc">Every lead that matches no other active rule goes here</div>
      </div>
      <Tag minimal icon="send-to">
        {summarizeTarget(rule.assignTarget)}
      </Tag>
    </div>
  );
}
