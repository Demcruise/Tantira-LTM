import { useState } from "react";
import { Button, Card, H4, Icon } from "@blueprintjs/core";
import type { AutoProcessedEntry, Lead } from "../types";
import type { AppView, FilterPreset } from "../components/app-sidebar-4";
import { relativeTime } from "../lib/relativeTime";
import { FunnelChart } from "../components/pipeline/FunnelChart";
import { AccuracyTrendChart } from "../components/pipeline/AccuracyTrendChart";
import { WorkflowRunInspectorDialog } from "../components/pipeline/WorkflowRunInspectorDialog";
import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiRow";

interface PipelineHealthPageProps {
  leads: Lead[];
  autoProcessedLog: AutoProcessedEntry[];
  onNavigate: (view: AppView, filterPreset?: FilterPreset) => void;
}

interface RecentRun {
  leadId: string;
  leadName: string;
  lastTime: string;
  stepCount: number;
  hasFailure: boolean;
}

function buildRecentRuns(entries: AutoProcessedEntry[]): RecentRun[] {
  const byLead = new Map<string, RecentRun>();
  for (const e of entries) {
    const existing = byLead.get(e.leadId);
    if (!existing) {
      byLead.set(e.leadId, { leadId: e.leadId, leadName: e.leadName, lastTime: e.time, stepCount: 1, hasFailure: e.eventType === "sync_failed" });
    } else {
      existing.stepCount += 1;
      if (e.eventType === "sync_failed") existing.hasFailure = true;
      if (new Date(e.time).getTime() > new Date(existing.lastTime).getTime()) existing.lastTime = e.time;
    }
  }
  return [...byLead.values()].sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()).slice(0, 6);
}

export function PipelineHealthPage({ leads, autoProcessedLog, onNavigate }: PipelineHealthPageProps) {
  const [viewingLeadId, setViewingLeadId] = useState<string | null>(null);

  const open = leads.filter((l) => l.status !== "Lost");
  const unassigned = open.filter((l) => l.assignedTo === null).length;
  const awaitingSync = open.filter((l) => l.assignedTo !== null && l.writebackState !== "synced" && l.writebackState !== "failed").length;
  const failedSync = open.filter((l) => l.writebackState === "failed").length;
  const won = leads.filter((l) => l.outcome === "Won").length;

  const recentRuns = buildRecentRuns(autoProcessedLog);
  const viewingRun = recentRuns.find((r) => r.leadId === viewingLeadId);
  const viewingSteps = viewingLeadId
    ? autoProcessedLog.filter((e) => e.leadId === viewingLeadId).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    : [];

  return (
    <div className="pipeline-page">
      <PageHeader
        section="Automate"
        title="Pipeline Health"
        description="The health check for the whole triage flow: where leads stall between capture and CRM sync, and whether the prioritization model is predicting wins. Every drop-off links to the page that fixes it."
      />
      <div className="kpi-row">
        <KpiCard label="Open leads" value={open.length} icon="people" intent="primary" />
        <KpiCard label="Unassigned" value={unassigned} icon="warning-sign" intent={unassigned > 0 ? "danger" : undefined} />
        <KpiCard label="Awaiting CRM sync" value={awaitingSync} icon="cloud-upload" intent={awaitingSync > 0 ? "warning" : undefined} />
        <KpiCard label="Sync failed" value={failedSync} icon="error" intent={failedSync > 0 ? "danger" : undefined} />
      </div>
      <FunnelChart leads={leads} onNavigate={onNavigate} />
      <AccuracyTrendChart leads={leads} />
      <p className="pipeline-page__footnote">
        {won} outcome{won === 1 ? "" : "s"} logged as Won feed the accuracy trend above — log outcomes from a lead's detail panel to improve it.
      </p>

      <Card elevation={1} className="pipeline-page__runs">
        <H4>Recent Runs</H4>
        <p className="pipeline-page__runs-hint">The most recently processed leads — step through exactly what automation did, in order.</p>
        <div className="pipeline-page__runs-list">
          {recentRuns.map((run) => (
            <div key={run.leadId} className="pipeline-page__run-row">
              <Icon icon={run.hasFailure ? "error" : "tick-circle"} intent={run.hasFailure ? "danger" : "success"} size={14} />
              <div className="pipeline-page__run-text">
                <span className="pipeline-page__run-name">{run.leadName}</span>
                <span className="pipeline-page__run-meta">
                  {run.stepCount} step{run.stepCount === 1 ? "" : "s"} · {relativeTime(run.lastTime)}
                </span>
              </div>
              <Button minimal small text="View run" rightIcon="arrow-right" onClick={() => setViewingLeadId(run.leadId)} />
            </div>
          ))}
        </div>
      </Card>

      <WorkflowRunInspectorDialog
        isOpen={viewingLeadId !== null}
        onClose={() => setViewingLeadId(null)}
        leadName={viewingRun?.leadName ?? null}
        steps={viewingSteps}
      />
    </div>
  );
}
