import { Icon } from "@blueprintjs/core";
import type { Lead } from "../types";
import { computeSlaStatus, SLA_RISK_COLOR } from "../lib/sla";

export function SlaBadge({ lead }: { lead: Pick<Lead, "priority" | "createdAt"> }) {
  const { risk, label } = computeSlaStatus(lead);

  return (
    <span className="sla-badge" style={{ color: SLA_RISK_COLOR[risk] }}>
      <Icon icon={risk === "overdue" ? "warning-sign" : "time"} size={12} />
      {label}
    </span>
  );
}
