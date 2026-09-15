import { Callout } from "@blueprintjs/core";
import type { AssignmentRule } from "../../types";
import { summarizeTarget } from "../../lib/ruleEngine";

export function MatchResultPreview({ matchedRule }: { matchedRule: AssignmentRule | null }) {
  if (!matchedRule) {
    return (
      <Callout intent="warning" icon="warning-sign" title="No rule matched">
        This sample lead doesn't match any active rule. Check that your catch-all rule is active.
      </Callout>
    );
  }

  return (
    <Callout intent="success" icon="tick-circle" title={matchedRule.isCatchAll ? "Matched the catch-all rule" : `Matched Rule #${matchedRule.priority}`}>
      Would be assigned to <strong>{summarizeTarget(matchedRule.assignTarget)}</strong>.
    </Callout>
  );
}
