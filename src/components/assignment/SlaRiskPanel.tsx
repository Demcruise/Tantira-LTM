import { Button, Card, H4, HTMLTable, NonIdealState } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { computeSlaStatus } from "../../lib/sla";
import { PriorityTag } from "../Tags";
import { SlaBadge } from "../SlaBadge";
import { KpiCard } from "../KpiRow";

function relativeTime(iso: string): string {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

interface SlaRiskPanelProps {
  leads: Lead[];
  onOpenLead: (leadId: string) => void;
}

export function SlaRiskPanel({ leads, onOpenLead }: SlaRiskPanelProps) {
  const openLeads = leads.filter((l) => l.status !== "Lost");

  const withStatus = openLeads.map((lead) => ({ lead, status: computeSlaStatus(lead) }));
  const overdue = withStatus.filter((x) => x.status.risk === "overdue");
  const atRisk = withStatus.filter((x) => x.status.risk === "atRisk");
  const onTrack = withStatus.filter((x) => x.status.risk === "onTrack");
  const compliance = openLeads.length === 0 ? 100 : Math.round((onTrack.length / openLeads.length) * 100);

  const flagged = [...overdue, ...atRisk].sort((a, b) => a.status.remainingHours - b.status.remainingHours);

  return (
    <Card elevation={1} className="sla-risk-panel">
      <H4>SLA Risk</H4>
      <p className="sla-risk-panel__hint">Leads that have breached or are approaching their priority-based response window.</p>

      <div className="kpi-row sla-risk-panel__kpis">
        <KpiCard label="Overdue" value={overdue.length} icon="warning-sign" intent={overdue.length > 0 ? "danger" : undefined} />
        <KpiCard label="At risk" value={atRisk.length} icon="time" intent={atRisk.length > 0 ? "warning" : undefined} />
        <KpiCard label="On track" value={onTrack.length} icon="tick-circle" intent="success" />
        <KpiCard label="SLA compliance" value={`${compliance}%`} icon="percentage" intent="primary" />
      </div>

      {flagged.length === 0 ? (
        <NonIdealState icon="tick-circle" title="No leads at risk" description="Every open lead is within its SLA window." />
      ) : (
        <HTMLTable className="sla-risk-panel__table" interactive>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Rep</th>
              <th>Priority</th>
              <th>Captured</th>
              <th>SLA status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {flagged.map(({ lead }) => (
              <tr key={lead.id} className="sla-risk-panel__row">
                <td>
                  <div className="sla-risk-panel__lead-name">{lead.name}</div>
                  <div className="sla-risk-panel__lead-company">{lead.company}</div>
                </td>
                <td>{lead.assignedTo ?? <span className="leads-table__unassigned">Unassigned</span>}</td>
                <td>
                  <PriorityTag priority={lead.priority} />
                </td>
                <td className="sla-risk-panel__captured">{relativeTime(lead.createdAt)}</td>
                <td>
                  <SlaBadge lead={lead} />
                </td>
                <td className="sla-risk-panel__action">
                  <Button small minimal icon="arrow-right" text="Open" onClick={() => onOpenLead(lead.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      )}
    </Card>
  );
}
