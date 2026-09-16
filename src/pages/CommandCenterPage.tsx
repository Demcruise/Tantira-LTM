import { Button, Card, H4, Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { AppView, FilterPreset } from "../types";
import type { AutoProcessedEntry, CrmConnection, Lead } from "../types";
import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiRow";
import { countNeedsAttention } from "../lib/needsAttention";
import { computeSlaStatus } from "../lib/sla";

interface CommandCenterPageProps {
  leads: Lead[];
  connections: CrmConnection[];
  autoProcessedLog: AutoProcessedEntry[];
  onNavigate: (view: AppView, filterPreset?: FilterPreset) => void;
}

interface QuickNavCard {
  label: string;
  description: string;
  icon: IconName;
  view: AppView;
  filterPreset?: FilterPreset;
}

const QUICK_NAV: QuickNavCard[] = [
  { label: "Attention Center", description: "Exceptions needing a human decision", icon: "inbox", view: "needs-attention" },
  { label: "My Leads", description: "Your personal queue", icon: "person", view: "my-leads" },
  { label: "Pipeline Health", description: "Where leads stall in the funnel", icon: "pulse", view: "pipeline" },
  { label: "Connections", description: "CRM sync status", icon: "cloud", view: "connections" },
  { label: "Performance", description: "Outcomes and model accuracy", icon: "chart", view: "performance" },
];

export function CommandCenterPage({ leads, connections, autoProcessedLog, onNavigate }: CommandCenterPageProps) {
  const open = leads.filter((l) => l.status !== "Lost");
  const newToday = leads.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;
  const hotOpen = open.filter((l) => l.priority === "Hot").length;
  const slaBreached = open.filter((l) => computeSlaStatus(l).risk === "overdue").length;
  const needsAttention = countNeedsAttention(leads);
  const syncIssues = connections.filter((c) => c.status !== "healthy").length + connections.reduce((sum, c) => sum + c.conflicts.length, 0);
  const automatedThisWeek = autoProcessedLog.filter((e) => Date.now() - new Date(e.time).getTime() <= 7 * 24 * 60 * 60 * 1000).length;

  return (
    <div className="command-center-page">
      <PageHeader
        section="Operate"
        title="Command Center"
        description="System-wide snapshot: what's new, what needs attention, and where to go next. Attention Center stays the place to act — this is where to look first."
      />

      <div className="kpi-row">
        <KpiCard label="Open Leads" value={open.length} icon="people" intent="primary" />
        <KpiCard label="New Today" value={newToday} icon="star" intent="success" />
        <KpiCard label="Hot Leads Open" value={hotOpen} icon="flame" intent={hotOpen > 0 ? "danger" : undefined} />
        <KpiCard label="Response deadlines missed" value={slaBreached} icon="warning-sign" intent={slaBreached > 0 ? "danger" : undefined} />
        <KpiCard label="Sync Issues" value={syncIssues} icon="offline" intent={syncIssues > 0 ? "warning" : undefined} />
        <KpiCard label="Automated (7d)" value={automatedThisWeek} icon="automatic-updates" intent="primary" />
      </div>

      {needsAttention > 0 && (
        <Card elevation={1} className="command-center-page__callout">
          <Icon icon="warning-sign" intent="warning" size={18} />
          <div className="command-center-page__callout-text">
            <strong>{needsAttention} item{needsAttention === 1 ? "" : "s"}</strong> need a human decision right now.
          </div>
          <Button intent="primary" text="Go to Attention Center" rightIcon="arrow-right" onClick={() => onNavigate("needs-attention")} />
        </Card>
      )}

      <div>
        <H4>Where to go next</H4>
        <div className="command-center-page__nav-grid">
          {QUICK_NAV.map((item) => (
            <Card
              key={item.label}
              interactive
              elevation={1}
              className="command-center-page__nav-card"
              onClick={() => onNavigate(item.view, item.filterPreset)}
            >
              <Icon icon={item.icon} size={20} className="command-center-page__nav-icon" />
              <div>
                <div className="command-center-page__nav-label">{item.label}</div>
                <div className="command-center-page__nav-desc">{item.description}</div>
              </div>
              <Icon icon="chevron-right" size={14} className="command-center-page__nav-arrow" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
