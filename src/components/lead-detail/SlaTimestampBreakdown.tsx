import { Icon } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { SLA_HOURS_BY_PRIORITY } from "../../types";
import { formatSlaHours } from "../../lib/sla";

function fmt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function SlaTimestampBreakdown({ lead }: { lead: Lead }) {
  const firstResponse = lead.actions.find((a) => a.type === "contact");
  const targetHours = SLA_HOURS_BY_PRIORITY[lead.priority];
  const actualHours = firstResponse ? (new Date(firstResponse.time).getTime() - new Date(lead.createdAt).getTime()) / 3_600_000 : null;
  const breached = actualHours !== null && actualHours > targetHours;

  return (
    <div className="sla-breakdown">
      <div className="sla-breakdown__row">
        <span className="sla-breakdown__label">Captured</span>
        <span className="sla-breakdown__value">{fmt(lead.createdAt)}</span>
      </div>
      <div className="sla-breakdown__row">
        <span className="sla-breakdown__label">First response</span>
        <span className="sla-breakdown__value">{firstResponse ? fmt(firstResponse.time) : "Not yet"}</span>
      </div>
      <div className="sla-breakdown__row">
        <span className="sla-breakdown__label">Target</span>
        <span className="sla-breakdown__value">{targetHours}h</span>
      </div>
      {actualHours !== null && (
        <div className={`sla-breakdown__result ${breached ? "sla-breakdown__result--breached" : "sla-breakdown__result--ok"}`}>
          <Icon icon={breached ? "warning-sign" : "tick-circle"} size={12} />
          {breached ? `Breached by ${formatSlaHours(actualHours - targetHours)}` : `Met — ${formatSlaHours(actualHours)} to respond`}
        </div>
      )}
    </div>
  );
}
