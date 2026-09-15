import { Card, H4, Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { KpiSummary } from "../types";

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  intent?: "primary" | "warning" | "danger" | "success";
}

export function KpiCard({ label, value, icon, intent }: KpiCardProps) {
  return (
    <Card className="kpi-card" elevation={1}>
      <div className="kpi-card__icon">
        <Icon icon={icon} size={20} intent={intent} />
      </div>
      <div>
        <div className="kpi-card__label">{label}</div>
        <H4 className="kpi-card__value">{value}</H4>
      </div>
    </Card>
  );
}

export function KpiRow({ summary }: { summary: KpiSummary }) {
  return (
    <div className="kpi-row">
      <KpiCard label="Total Leads" value={summary.totalLeads} icon="people" intent="primary" />
      <KpiCard label="New Today" value={summary.newToday} icon="star" intent="success" />
      <KpiCard
        label="Unassigned"
        value={summary.unassigned}
        icon="warning-sign"
        intent={summary.unassigned > 0 ? "danger" : undefined}
      />
      <KpiCard label="Avg. Lead Score" value={summary.avgScore} icon="trending-up" intent="primary" />
    </div>
  );
}
