import { useMemo, useState } from "react";
import { Button, Callout, Card, NonIdealState, Tag } from "@blueprintjs/core";
import type { AppView } from "../components/app-sidebar-4";
import type { AttentionReason, Lead, LeadActionType } from "../types";
import { REASON_ACTION, REASON_LABEL, REASON_ORDER, buildAttentionQueue } from "../lib/needsAttention";
import { LeadsAreaTabs } from "../components/needs-attention/LeadsAreaTabs";
import { ReasonBadge } from "../components/needs-attention/ReasonBadge";
import { PageHeader } from "../components/PageHeader";
import { PriorityTag } from "../components/Tags";
import { SlaBadge } from "../components/SlaBadge";

interface NeedsAttentionPageProps {
  leads: Lead[];
  processedThisWeek: number;
  intakeUnresolved: number;
  onOpenLead: (leadId: string) => void;
  onChangeView: (view: AppView) => void;
  onRetrySync: (leadId: string) => void;
  onLeadAction: (leadId: string, action: LeadActionType) => void;
}

export function NeedsAttentionPage({ leads, processedThisWeek, intakeUnresolved, onOpenLead, onChangeView, onRetrySync, onLeadAction }: NeedsAttentionPageProps) {
  const queue = useMemo(() => buildAttentionQueue(leads), [leads]);
  const [filter, setFilter] = useState<AttentionReason | "all">("all");

  const counts = REASON_ORDER.map((reason) => ({ reason, count: queue.filter((q) => q.reason === reason).length })).filter((c) => c.count > 0);
  const visible = filter === "all" ? queue : queue.filter((q) => q.reason === filter);

  function quickAction(leadId: string, reason: AttentionReason) {
    if (reason === "sync_conflict") onRetrySync(leadId);
    else if (reason === "sla_at_risk") onLeadAction(leadId, "escalate");
    else onOpenLead(leadId);
  }

  return (
    <div className="needs-attention-page">
      <PageHeader
        section="Operate"
        title="Attention Center"
        description={`${queue.length} item${queue.length === 1 ? "" : "s"} need a human decision · ${processedThisWeek} handled automatically this week. Everything the automation could not finish on its own lands here, in severity order.`}
        tabs={<LeadsAreaTabs current="needs-attention" onChange={onChangeView} />}
      />

      {intakeUnresolved > 0 && (
        <Callout intent="primary" icon="inbox" className="attention-intake">
          <span>
            <strong>{intakeUnresolved}</strong> inbound message{intakeUnresolved === 1 ? "" : "s"} could not be turned into a lead automatically — ambiguous person, missing company or possible duplicate.
          </span>
          <Button small intent="primary" rightIcon="arrow-right" text="Review intake" onClick={() => onChangeView("intake")} />
        </Callout>
      )}

      <div className="attention-filters">
        <button type="button" className={`attention-filter${filter === "all" ? " attention-filter--active" : ""}`} onClick={() => setFilter("all")}>
          All <span className="attention-filter__count">{queue.length}</span>
        </button>
        {counts.map(({ reason, count }) => (
          <button
            key={reason}
            type="button"
            className={`attention-filter${filter === reason ? " attention-filter--active" : ""}`}
            title={REASON_ACTION[reason].description}
            onClick={() => setFilter(filter === reason ? "all" : reason)}
          >
            {REASON_LABEL[reason]} <span className="attention-filter__count">{count}</span>
          </button>
        ))}
      </div>

      <Card className="page-card attention-queue">
        {visible.length === 0 ? (
          <NonIdealState icon="tick-circle" title="Nothing needs you" description="Every lead is either flowing automatically or already with its owner." />
        ) : (
          visible.map(({ lead, reason }) => (
            <div key={lead.id} className="attention-row">
              <PriorityTag priority={lead.priority} />
              <div className="attention-row__lead">
                <span className="attention-row__name">{lead.name}</span>
                <span className="attention-row__company">
                  {lead.company}
                  {lead.assignedTo && ` · ${lead.assignedTo}`}
                </span>
              </div>
              <div className="attention-row__reason">
                <ReasonBadge reason={reason} />
                <span className="attention-row__hint">{REASON_ACTION[reason].description}</span>
              </div>
              <SlaBadge lead={lead} />
              <div className="attention-row__actions">
                <Button small intent="primary" text={REASON_ACTION[reason].label} onClick={() => quickAction(lead.id, reason)} />
                <Button small minimal rightIcon="arrow-right" text="Open" onClick={() => onOpenLead(lead.id)} />
              </div>
            </div>
          ))
        )}
      </Card>

      {filter !== "all" && (
        <p className="attention-footnote">
          Showing {visible.length} of {queue.length}.{" "}
          <Tag minimal interactive onClick={() => setFilter("all")}>
            Clear filter
          </Tag>
        </p>
      )}
    </div>
  );
}
