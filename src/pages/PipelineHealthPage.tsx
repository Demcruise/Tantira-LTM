import type { Lead } from "../types";
import type { AppView } from "../components/app-sidebar-4";
import { FunnelChart } from "../components/pipeline/FunnelChart";
import { AccuracyTrendChart } from "../components/pipeline/AccuracyTrendChart";
import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiRow";

interface PipelineHealthPageProps {
  leads: Lead[];
  onNavigate: (view: AppView) => void;
}

export function PipelineHealthPage({ leads, onNavigate }: PipelineHealthPageProps) {
  const open = leads.filter((l) => l.status !== "Lost");
  const unassigned = open.filter((l) => l.assignedTo === null).length;
  const awaitingSync = open.filter((l) => l.assignedTo !== null && l.writebackState !== "synced" && l.writebackState !== "failed").length;
  const failedSync = open.filter((l) => l.writebackState === "failed").length;
  const won = leads.filter((l) => l.outcome === "Won").length;

  return (
    <div className="pipeline-page">
      <PageHeader
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
    </div>
  );
}
