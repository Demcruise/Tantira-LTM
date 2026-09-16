import { Button } from "@blueprintjs/core";
import type { AuditLogEntry, Lead, ScoringRule, TierThresholds } from "../types";
import { PageHeader } from "../components/PageHeader";
import { ScoringRuleTable } from "../components/prioritization/ScoringRuleTable";
import { TierThresholdEditor } from "../components/prioritization/TierThresholdEditor";
import { LiveSimulatorPanel } from "../components/prioritization/LiveSimulatorPanel";
import { ModelChangeHistory } from "../components/prioritization/ModelChangeHistory";
import { ModelFeedbackPanel } from "../components/prioritization/ModelFeedbackPanel";
import { DryRunModelPanel } from "../components/prioritization/DryRunModelPanel";

interface PrioritizationModelPageProps {
  rules: ScoringRule[];
  thresholds: TierThresholds;
  leads: Lead[];
  auditLog: AuditLogEntry[];
  onAddRule: () => void;
  onSaveRule: (rule: ScoringRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRuleStatus: (ruleId: string) => void;
  onChangeThresholds: (thresholds: TierThresholds) => void;
  onCommitThresholds: (thresholds: TierThresholds) => void;
}

const MODEL_ACTIONS = new Set([
  "Added scoring rule",
  "Edited scoring rule",
  "Deleted scoring rule",
  "Toggled scoring rule",
  "Changed threshold",
]);

export function PrioritizationModelPage({
  rules,
  thresholds,
  leads,
  auditLog,
  onAddRule,
  onSaveRule,
  onDeleteRule,
  onToggleRuleStatus,
  onChangeThresholds,
  onCommitThresholds,
}: PrioritizationModelPageProps) {
  const modelHistory = auditLog.filter((e) => MODEL_ACTIONS.has(e.action));

  return (
    <div className="prioritization-page-wrap">
      <PageHeader
        section="Optimize"
        title="Prioritization Model"
        description="Scoring rules and priority cutoffs that turn a lead's factors into Hot, Warm, or Cold — and the feedback from outcomes and owner overrides that tells you whether the model is right."
        actions={<Button intent="primary" icon="add" text="Add scoring rule" onClick={onAddRule} />}
      />
    <div className="prioritization-page">
      <div className="prioritization-page__main">
        <ScoringRuleTable rules={rules} onSaveRule={onSaveRule} onDeleteRule={onDeleteRule} onToggleStatus={onToggleRuleStatus} />

        <TierThresholdEditor
          thresholds={thresholds}
          leadScores={leads.map((l) => l.score)}
          onChange={onChangeThresholds}
          onCommit={onCommitThresholds}
        />

        <ModelFeedbackPanel leads={leads} />

        <DryRunModelPanel liveThresholds={thresholds} leads={leads} onApply={onCommitThresholds} />

        <ModelChangeHistory entries={modelHistory} />
      </div>

      <div className="prioritization-page__side">
        <LiveSimulatorPanel rules={rules} thresholds={thresholds} />
      </div>
    </div>
    </div>
  );
}
