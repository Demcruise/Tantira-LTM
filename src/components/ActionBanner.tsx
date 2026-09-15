import { Callout } from "@blueprintjs/core";
import type { Lead } from "../types";
import { computeSlaStatus } from "../lib/sla";
import { countNeedsAttention } from "../lib/needsAttention";

export function ActionBanner({ leads }: { leads: Lead[] }) {
  const openLeads = leads.filter((l) => l.status !== "Lost");
  const needsAction = countNeedsAttention(leads);
  const atSlaRisk = openLeads.filter((l) => {
    const { risk } = computeSlaStatus(l);
    return risk === "atRisk" || risk === "overdue";
  }).length;

  if (needsAction === 0 && atSlaRisk === 0) {
    return (
      <Callout intent="success" icon="tick-circle">
        All caught up — no leads need action right now.
      </Callout>
    );
  }

  return (
    <Callout intent="warning" icon="warning-sign">
      <strong>{needsAction}</strong> leads need your input, <strong>{atSlaRisk}</strong> at SLA risk.
    </Callout>
  );
}
