import { Button, Card, HTMLSelect, Icon, NonIdealState, Tag } from "@blueprintjs/core";
import type { Lead, LeadActionType, Priority } from "../types";
import { computeSlaStatus } from "../lib/sla";
import { explainLead } from "../lib/recommendation";
import { LEAD_ACTION_META, isSnoozed } from "../lib/leadActions";
import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiRow";
import { PriorityTag } from "../components/Tags";
import { SlaBadge } from "../components/SlaBadge";

const PRIORITY_ORDER: Record<Priority, number> = { Hot: 0, Warm: 1, Cold: 2 };
const RISK_ORDER = { overdue: 0, atRisk: 1, onTrack: 2 } as const;

interface MyLeadsPageProps {
  leads: Lead[];
  reps: string[];
  viewingAs: string;
  onChangeViewingAs: (rep: string) => void;
  onOpenLead: (leadId: string) => void;
  onLeadAction: (leadId: string, action: LeadActionType) => void;
}

function LeadWorkCard({ lead, onOpen, onAction }: { lead: Lead; onOpen: () => void; onAction: (type: LeadActionType) => void }) {
  const reasons = explainLead(lead);
  const nextAction: LeadActionType = lead.status === "Contacted" ? "qualify" : "contact";
  const meta = LEAD_ACTION_META[nextAction];
  const closed = lead.status === "Lost" || lead.status === "Qualified";

  return (
    <div className="work-card">
      <div className="work-card__main">
        <div className="work-card__title-row">
          <span className="work-card__name">{lead.name}</span>
          <span className="work-card__company">{lead.company}</span>
        </div>
        <div className="work-card__meta">
          <PriorityTag priority={lead.priority} />
          <span className="work-card__score">{lead.score}/100</span>
          <SlaBadge lead={lead} />
          <Tag minimal>{lead.status}</Tag>
          {lead.inNurture && (
            <Tag minimal icon="send-to">
              Nurture
            </Tag>
          )}
        </div>
        <div className="work-card__reasons">
          <span className="work-card__reasons-label">Why this matters</span>
          {reasons.map((r) => (
            <span key={r} className="work-card__reason">
              {r}
            </span>
          ))}
        </div>
      </div>
      <div className="work-card__actions">
        {!closed && <Button intent="primary" small icon={meta.icon} text={nextAction === "contact" ? "Respond" : "Qualify"} onClick={() => onAction(nextAction)} />}
        <Button small minimal rightIcon="arrow-right" text="Open" onClick={onOpen} />
      </div>
    </div>
  );
}

export function MyLeadsPage({ leads, reps, viewingAs, onChangeViewingAs, onOpenLead, onLeadAction }: MyLeadsPageProps) {
  const mine = leads.filter((l) => l.assignedTo === viewingAs && l.status !== "Lost");
  const snoozed = mine.filter((l) => isSnoozed(l.snoozedUntil));
  const active = mine
    .filter((l) => !isSnoozed(l.snoozedUntil))
    .map((l) => ({ lead: l, sla: computeSlaStatus(l) }))
    .sort((a, b) => RISK_ORDER[a.sla.risk] - RISK_ORDER[b.sla.risk] || PRIORITY_ORDER[a.lead.priority] - PRIORITY_ORDER[b.lead.priority] || b.lead.score - a.lead.score);

  const urgent = active.filter((x) => x.sla.risk !== "onTrack");
  const onTrack = active.filter((x) => x.sla.risk === "onTrack");
  const hot = mine.filter((l) => l.priority === "Hot").length;

  return (
    <div className="my-leads-page">
      <PageHeader
        section="Operate"
        title="My Leads"
        description="Your queue, ordered by what needs a response first. Each card says why the lead matters and what to do next; open it for the full context."
        actions={
          <div className="my-leads-page__viewer">
            <Icon icon="person" size={13} />
            <span>Viewing as</span>
            <HTMLSelect minimal value={viewingAs} onChange={(e) => onChangeViewingAs(e.target.value)}>
              {reps.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </HTMLSelect>
          </div>
        }
      />

      <div className="kpi-row">
        <KpiCard label="Open" value={mine.length} icon="inbox" intent="primary" />
        <KpiCard label="Hot" value={hot} icon="flame" intent={hot > 0 ? "danger" : undefined} />
        <KpiCard label="Needs response" value={urgent.length} icon="time" intent={urgent.length > 0 ? "warning" : undefined} />
        <KpiCard label="On track" value={onTrack.length} icon="tick-circle" intent="success" />
      </div>

      {mine.length === 0 ? (
        <Card className="page-card">
          <NonIdealState icon="inbox" title="No open leads" description={`Nothing is assigned to ${viewingAs} right now. New leads arrive here as soon as they are routed.`} />
        </Card>
      ) : (
        <>
          <Card className="page-card">
            <div className="my-leads-page__section-title">
              <span>Respond now</span>
              <span className="my-leads-page__count">{urgent.length}</span>
            </div>
            {urgent.length === 0 ? (
              <p className="my-leads-page__empty">Nothing overdue or at risk.</p>
            ) : (
              urgent.map(({ lead }) => <LeadWorkCard key={lead.id} lead={lead} onOpen={() => onOpenLead(lead.id)} onAction={(t) => onLeadAction(lead.id, t)} />)
            )}
          </Card>
          <Card className="page-card">
            <div className="my-leads-page__section-title">
              <span>On track</span>
              <span className="my-leads-page__count">{onTrack.length}</span>
            </div>
            {onTrack.length === 0 ? (
              <p className="my-leads-page__empty">Everything here needs a response.</p>
            ) : (
              onTrack.map(({ lead }) => <LeadWorkCard key={lead.id} lead={lead} onOpen={() => onOpenLead(lead.id)} onAction={(t) => onLeadAction(lead.id, t)} />)
            )}
          </Card>
          {snoozed.length > 0 && (
            <Card className="page-card">
              <div className="my-leads-page__section-title">
                <span>Snoozed</span>
                <span className="my-leads-page__count">{snoozed.length}</span>
              </div>
              {snoozed.map((lead) => (
                <LeadWorkCard key={lead.id} lead={lead} onOpen={() => onOpenLead(lead.id)} onAction={(t) => onLeadAction(lead.id, t)} />
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
