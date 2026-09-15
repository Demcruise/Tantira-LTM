import { Button, Card, H4, Icon } from "@blueprintjs/core";
import type { Lead } from "../../types";
import type { AppView, FilterPreset } from "../app-sidebar-4";
import { buildFunnelStages, withDropOff } from "../../lib/pipeline";

function dropOffColor(pct: number): string {
  if (pct >= 30) return "#CD4246";
  if (pct >= 10) return "#C87619";
  return "#5F6B7C";
}

interface StageCta {
  reason: string;
  label?: string;
  view?: AppView;
  filterPreset?: FilterPreset;
}

interface LiveCounts {
  unassignedOpen: number;
  lostUnassigned: number;
  awaitingSync: number;
}

function stageCta(key: string, dropped: number, live: LiveCounts): StageCta | null {
  if (dropped === 0) return null;
  switch (key) {
    case "enriched":
      return { reason: "Duplicates collapsed at capture. Anything the extractor could not resolve waits in Inbound Sources.", label: "Review intake", view: "intake" };
    case "assigned": {
      const lostNote = live.lostUnassigned > 0 ? ` (${live.lostUnassigned} marked Lost, not actionable)` : "";
      if (live.unassignedOpen === 0) return { reason: `Nothing waiting${lostNote}.` };
      return {
        reason: `${live.unassignedOpen} open lead${live.unassignedOpen === 1 ? "" : "s"} still waiting for an owner${lostNote}.`,
        label: "Assign now",
        view: "dashboard",
        filterPreset: { status: "Open", assignee: "Unassigned" },
      };
    }
    case "synced":
      if (live.awaitingSync === 0) return { reason: "Every assigned lead is written back." };
      return {
        reason: `${live.awaitingSync} assigned lead${live.awaitingSync === 1 ? "" : "s"} not yet written back to the CRM.`,
        label: "Check connections",
        view: "connections",
      };
    default:
      return null;
  }
}

interface FunnelChartProps {
  leads: Lead[];
  onNavigate: (view: AppView, filterPreset?: FilterPreset) => void;
}

export function FunnelChart({ leads, onNavigate }: FunnelChartProps) {
  const steps = withDropOff(buildFunnelStages(leads));
  const first = steps[0];
  const last = steps[steps.length - 1];
  const overallConversion = first.count > 0 ? (last.count / first.count) * 100 : 0;
  const live: LiveCounts = {
    unassignedOpen: leads.filter((l) => l.status !== "Lost" && l.assignedTo === null).length,
    lostUnassigned: leads.filter((l) => l.status === "Lost" && l.assignedTo === null).length,
    awaitingSync: leads.filter((l) => l.status !== "Lost" && l.assignedTo !== null && l.writebackState !== "synced").length,
  };

  return (
    <Card elevation={1} className="funnel-chart">
      <div className="funnel-chart__title-row">
        <H4>Lead flow</H4>
        <span className="funnel-chart__overall">{overallConversion.toFixed(0)}% ingested → synced</span>
      </div>
      <p className="funnel-chart__subtitle">Ingested → Enriched → Prioritized → Assigned → Synced. Each drop-off points to the page where it gets fixed.</p>

      <div className="funnel-chart__stages">
        {steps.map((step, i) => {
          const cta = stageCta(step.key, step.dropOffCount, live);
          return (
            <div key={step.key} className="funnel-chart__stage">
              <div className="funnel-chart__stage-header">
                <span className="funnel-chart__stage-label">{step.label}</span>
                <span className="funnel-chart__stage-count">{step.count}</span>
              </div>
              <div className="funnel-chart__bar-track">
                <div className="funnel-chart__bar" style={{ width: `${step.widthPct}%` }} />
              </div>
              {i > 0 && (
                <div className="funnel-chart__dropoff-row">
                  <div className="funnel-chart__dropoff" style={{ color: dropOffColor(step.dropOffPct) }}>
                    {step.dropOffCount > 0 ? (
                      <>
                        <Icon icon="arrow-down" size={11} />
                        {step.dropOffCount} dropped ({step.dropOffPct.toFixed(0)}%)
                      </>
                    ) : (
                      <>
                        <Icon icon="tick" size={11} />
                        No loss
                      </>
                    )}
                  </div>
                  {cta && (
                    <div className="funnel-chart__cta">
                      <span className="funnel-chart__cta-reason">{cta.reason}</span>
                      {cta.label && cta.view && (
                        <Button
                          small
                          minimal
                          intent="primary"
                          rightIcon="arrow-right"
                          text={cta.label}
                          onClick={() => onNavigate(cta.view!, cta.filterPreset)}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
