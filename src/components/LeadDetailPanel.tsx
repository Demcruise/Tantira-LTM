import { Button, Drawer, Icon, Tag } from "@blueprintjs/core";
import type { ActivityChannel, ConflictResolution, Lead, LeadActionType, Outcome, OverrideReason, ScoringRule, SyncConflict } from "../types";
import { getRepLoad } from "../lib/capacity";
import { priorityConfidence } from "../lib/scoring";
import { isSnoozed } from "../lib/leadActions";
import type { LeadRecommendation } from "../lib/recommendation";
import { RecommendationCard } from "./lead-detail/RecommendationCard";
import { AiAnalysisPanel } from "./lead-detail/AiAnalysisPanel";
import { LeadActionsBar } from "./lead-detail/LeadActionsBar";
import { LeadLifecycleStepper } from "./lead-detail/LeadLifecycleStepper";
import { DownstreamSection } from "./lead-detail/DownstreamSection";
import { sequenceProgress } from "../lib/downstream";
import { SectionAccordion } from "./lead-detail/SectionAccordion";
import { EnrichmentSection } from "./lead-detail/EnrichmentSection";
import { PrioritizationSection } from "./lead-detail/PrioritizationSection";
import { AssignmentPanel } from "./lead-detail/AssignmentPanel";
import { WritebackSection } from "./lead-detail/WritebackSection";
import { OutcomeForm } from "./lead-detail/OutcomeForm";
import { PredictionOutcomeCard } from "./lead-detail/PredictionOutcomeCard";
import { DecisionTrace } from "./lead-detail/DecisionTrace";
import { SuggestedAction, type SuggestedActionKey } from "./lead-detail/SuggestedAction";
import { ActivityTimeline } from "./lead-detail/ActivityTimeline";

type LeadConflict = SyncConflict & { connectionId: string; connectionName: string };

interface LeadDetailPanelProps {
  lead: Lead | null;
  leads: Lead[];
  assigneeOptions: string[];
  scoringRules: ScoringRule[];
  conflict: LeadConflict | null;
  onClose: () => void;
  onAssign: (leadId: string, assignee: string) => void;
  onRetrySync: (leadId: string) => void;
  onLogOutcome: (leadId: string, outcome: Outcome, reason: string) => void;
  onCorrectMatch: (leadId: string) => void;
  onResolveAmbiguous: (leadId: string, resolution: string | "new") => void;
  onResolveConflict: (connectionId: string, conflictId: string, resolution: ConflictResolution) => void;
  onOpenFullView: (leadId: string) => void;
  onSuggestedAction: (leadId: string, action: SuggestedActionKey) => void;
  recommendation: LeadRecommendation | null;
  onAcceptRecommendation: (leadId: string, owner: string) => void;
  onOverrideRecommendation: (leadId: string, owner: string, reason: OverrideReason) => void;
  onLeadAction: (leadId: string, action: LeadActionType) => void;
  onLogActivity: (leadId: string, payload: { channel: ActivityChannel; note: string; followUpDueAt: string | null }) => void;
  asFullPage?: boolean;
}

export function LeadDetailPanel({
  lead,
  leads,
  assigneeOptions,
  scoringRules,
  conflict,
  onClose,
  onAssign,
  onRetrySync,
  onLogOutcome,
  onCorrectMatch,
  onResolveAmbiguous,
  onResolveConflict,
  onOpenFullView,
  onSuggestedAction,
  recommendation,
  onAcceptRecommendation,
  onOverrideRecommendation,
  onLeadAction,
  onLogActivity,
  asFullPage = false,
}: LeadDetailPanelProps) {
  if (!lead) {
    return asFullPage ? null : <Drawer isOpen={false} onClose={onClose} />;
  }

  const confidence = priorityConfidence(lead.score);
  const repLoad = lead.assignedTo ? getRepLoad(leads, lead.assignedTo) : undefined;

  const enrichmentFlagged = lead.accountMatch === "ambiguous";
  const enrichmentSummary =
    lead.accountMatch === "matched" ? `Matched — ${lead.company}` : lead.accountMatch === "new" ? "New account" : "Ambiguous match";

  const prioritizationFlagged = confidence < 75;
  const prioritizationSummary = `${lead.priority} (${confidence}% conf.)`;

  const assignmentFlagged = lead.assignedTo === null || (repLoad ? repLoad.ratio >= 0.9 : false);
  const assignmentSummary = lead.assignedTo
    ? lead.decision
      ? `${lead.assignedTo} · ${lead.decision.status === "accepted" ? "recommendation accepted" : "overridden"}`
      : lead.assignedTo
    : recommendation?.owner
      ? `Unassigned — recommends ${recommendation.owner}`
      : "Unassigned";

  const writebackFlagged = lead.writebackState === "failed" || conflict !== null;
  const writebackSummary = conflict
    ? "Sync conflict"
    : lead.writebackState === "synced"
      ? "Synced"
      : lead.writebackState === "syncing"
        ? "Syncing…"
        : lead.writebackState === "failed"
          ? "Failed"
          : "Not started";

  const content = (
    <div className="lead-detail">
      <div className="lead-detail__topbar">
        <div>
          <div className="lead-detail__name">{lead.name}</div>
          <div className="lead-detail__company-line">
            {lead.company}
            <Tag minimal className="lead-detail__status-tag">{lead.status}</Tag>
            {isSnoozed(lead.snoozedUntil) && (
              <Tag minimal icon="moon" className="lead-detail__status-tag">
                Snoozed
              </Tag>
            )}
          </div>
        </div>
        <div className="lead-detail__topbar-actions">
          {!asFullPage && (
            <Button minimal small icon="fullscreen" text="Open full view" onClick={() => onOpenFullView(lead.id)} />
          )}
          {!asFullPage && <Button minimal small icon="cross" onClick={onClose} />}
        </div>
      </div>

      <LeadLifecycleStepper lead={lead} />

      <LeadActionsBar lead={lead} onAction={(type) => onLeadAction(lead.id, type)} onLogActivity={(payload) => onLogActivity(lead.id, payload)} />

      <AiAnalysisPanel lead={lead} leads={leads} recommendation={recommendation} />

      <SectionAccordion flagged={enrichmentFlagged} title="Enrichment" summary={enrichmentSummary}>
        <EnrichmentSection lead={lead} onCorrectMatch={onCorrectMatch} onResolveAmbiguous={onResolveAmbiguous} />
      </SectionAccordion>

      <SectionAccordion flagged={prioritizationFlagged} title="Prioritization" summary={prioritizationSummary}>
        <PrioritizationSection lead={lead} confidence={confidence} rules={scoringRules} />
      </SectionAccordion>

      <SectionAccordion flagged={assignmentFlagged} title="Assignment" summary={assignmentSummary}>
        {lead.assignedTo === null && recommendation ? (
          <RecommendationCard
            lead={lead}
            recommendation={recommendation}
            assigneeOptions={assigneeOptions}
            onAccept={onAcceptRecommendation}
            onOverride={onOverrideRecommendation}
          />
        ) : (
          <>
            {lead.decision && (
              <div className={`decision-summary decision-summary--${lead.decision.status}`}>
                <Icon icon={lead.decision.status === "accepted" ? "thumbs-up" : "swap-horizontal"} size={12} />
                <span>
                  {lead.decision.status === "accepted" ? "Recommendation accepted" : `Overridden — ${lead.decision.reason}`}
                  {lead.decision.status === "overridden" && lead.decision.recommendedOwner && ` (Tantira suggested ${lead.decision.recommendedOwner})`}
                  {" · "}
                  {lead.decision.decidedBy}
                </span>
              </div>
            )}
            {lead.decision && <DecisionTrace decision={lead.decision} />}
            <AssignmentPanel lead={lead} leads={leads} assigneeOptions={assigneeOptions} onAssign={onAssign} />
          </>
        )}
      </SectionAccordion>

      {lead.assignedTo && (
        <SectionAccordion flagged={writebackFlagged} title="CRM Sync" summary={writebackSummary}>
          <WritebackSection lead={lead} conflict={conflict} onRetry={onRetrySync} onResolveConflict={onResolveConflict} />
        </SectionAccordion>
      )}

      {lead.downstream && (
        <SectionAccordion
          flagged={false}
          title="Downstream"
          summary={`${sequenceProgress(lead.downstream).def.label} · ${sequenceProgress(lead.downstream).completed}/${sequenceProgress(lead.downstream).total} steps`}
        >
          <DownstreamSection sequence={lead.downstream} />
        </SectionAccordion>
      )}

      {lead.writebackState === "synced" && (
        <div className="lead-detail__section-plain">
          <h5 className="bp5-heading">Outcome</h5>
          <OutcomeForm lead={lead} onLogOutcome={onLogOutcome} />
          <PredictionOutcomeCard lead={lead} />
          <SuggestedAction lead={lead} onAct={(key) => onSuggestedAction(lead.id, key)} />
        </div>
      )}

      <div className="lead-detail__section-plain">
        <h5 className="bp5-heading">Activity Timeline</h5>
        <ActivityTimeline lead={lead} />
      </div>
    </div>
  );

  if (asFullPage) {
    return content;
  }

  return (
    <Drawer isOpen={lead !== null} onClose={onClose} size="460px" position="right">
      {content}
    </Drawer>
  );
}
