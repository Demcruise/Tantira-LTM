import { Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { AttentionReason } from "../../types";
import { REASON_LABEL } from "../../lib/needsAttention";

const REASON_ICON: Record<AttentionReason, IconName> = {
  sync_conflict: "git-branch",
  rep_over_capacity: "people",
  ambiguous_match: "help",
  sla_at_risk: "time",
  awaiting_assignment: "person",
};

const REASON_COLOR: Record<AttentionReason, string> = {
  sync_conflict: "#CD4246",
  rep_over_capacity: "#C87619",
  ambiguous_match: "#5F6B7C",
  sla_at_risk: "#C87619",
  awaiting_assignment: "#2D72D2",
};

export function ReasonBadge({ reason }: { reason: AttentionReason }) {
  return (
    <span className="reason-badge" style={{ color: REASON_COLOR[reason] }}>
      <Icon icon={REASON_ICON[reason]} size={12} />
      {REASON_LABEL[reason]}
    </span>
  );
}
