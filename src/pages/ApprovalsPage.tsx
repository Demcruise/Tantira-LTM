import { Button, Card, HTMLTable, NonIdealState, Tag } from "@blueprintjs/core";
import type { Lead, RecommendationDecision } from "../types";
import { PageHeader } from "../components/PageHeader";
import { relativeTime } from "../lib/relativeTime";

interface ApprovalsPageProps {
  leads: Lead[];
  acknowledgedIds: Set<string>;
  onAcknowledge: (leadId: string) => void;
  onOpenLead: (leadId: string) => void;
}

function hasOverriddenDecision(lead: Lead): lead is Lead & { decision: RecommendationDecision } {
  return lead.decision?.status === "overridden";
}

export function ApprovalsPage({ leads, acknowledgedIds, onAcknowledge, onOpenLead }: ApprovalsPageProps) {
  const overridden = leads
    .filter(hasOverriddenDecision)
    .filter((l) => !acknowledgedIds.has(l.id))
    .sort((a, b) => new Date(b.decision.decidedAt).getTime() - new Date(a.decision.decidedAt).getTime());

  return (
    <div className="approvals-page">
      <PageHeader
        section="Govern"
        title="Approvals"
        description="Assignment recommendations that a human overrode. Overrides take effect immediately — this is retrospective oversight, not a pre-approval gate. Review the reason, then acknowledge or open the lead for a closer look."
      />

      <Card className="page-card">
        {overridden.length === 0 ? (
          <NonIdealState icon="tick-circle" title="Nothing to review" description="No unreviewed overrides right now." />
        ) : (
          <HTMLTable className="approvals-page__table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Recommended</th>
                <th>Chosen</th>
                <th>Reason</th>
                <th>Decided by</th>
                <th>When</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {overridden.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className="approvals-page__lead-name">{lead.name}</div>
                    <div className="approvals-page__lead-company">{lead.company}</div>
                  </td>
                  <td>{lead.decision.recommendedOwner ?? <span className="approvals-page__muted">None eligible</span>}</td>
                  <td>
                    <strong>{lead.decision.chosenOwner}</strong>
                  </td>
                  <td>
                    <Tag minimal>{lead.decision.reason}</Tag>
                  </td>
                  <td>{lead.decision.decidedBy}</td>
                  <td>{relativeTime(lead.decision.decidedAt)}</td>
                  <td>
                    <div className="approvals-page__row-actions">
                      <Button minimal small text="Open lead" onClick={() => onOpenLead(lead.id)} />
                      <Button minimal small intent="success" icon="tick" text="Acknowledge" onClick={() => onAcknowledge(lead.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        )}
      </Card>
    </div>
  );
}
