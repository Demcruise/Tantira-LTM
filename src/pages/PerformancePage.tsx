import { Button, Card, H4, HTMLTable, Icon, Tag } from "@blueprintjs/core";
import type { Lead } from "../types";
import type { AppView } from "../components/app-sidebar-4";
import { dailyVolume, formatHours, performanceSummary, repPerformance, slaByTier, sourcePerformance } from "../lib/analytics";
import { buildTierFunnel } from "../lib/feedback";
import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiRow";
import { PriorityTag } from "../components/Tags";

interface PerformancePageProps {
  leads: Lead[];
  onNavigate: (view: AppView) => void;
  onViewRep: (rep: string) => void;
}

function SectionTitle({ title, hint, action }: { title: string; hint: string; action?: { label: string; view: AppView; onNavigate: (v: AppView) => void } }) {
  return (
    <div className="perf__section-title">
      <div>
        <H4>{title}</H4>
        <p className="perf__hint">{hint}</p>
      </div>
      {action && <Button small minimal rightIcon="arrow-right" text={action.label} onClick={() => action.onNavigate(action.view)} />}
    </div>
  );
}

export function PerformancePage({ leads, onNavigate, onViewRep }: PerformancePageProps) {
  const summary = performanceSummary(leads);
  const daily = dailyVolume(leads);
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const sources = sourcePerformance(leads);
  const maxSource = Math.max(1, ...sources.map((s) => s.leads));
  const reps = repPerformance(leads);
  const sla = slaByTier(leads);
  const funnel = buildTierFunnel(leads);

  return (
    <div className="perf">
      <PageHeader
        section="Optimize"
        title="Performance"
        description="Is the whole system improving sales outcomes? Volume in, speed of response, SLA discipline, who is converting, and whether routing and prioritization are earning their keep. Each panel links to the control that changes it."
      />

      <div className="kpi-row">
        <KpiCard label="Leads (7d)" value={summary.leads7d} icon="inbox" intent="primary" />
        <KpiCard label="Median first response" value={formatHours(summary.medianResponseHours)} icon="time" intent={summary.medianResponseHours !== null && summary.medianResponseHours > 4 ? "warning" : "success"} />
        <KpiCard label="SLA compliance" value={`${summary.slaCompliance}%`} icon="endorsed" intent={summary.slaCompliance < 50 ? "danger" : summary.slaCompliance < 80 ? "warning" : "success"} />
        <KpiCard label="Win rate" value={`${summary.winRate}%`} icon="trophy" intent="success" />
      </div>

      <div className="perf__grid-2">
        <Card className="page-card">
          <SectionTitle title="Lead volume" hint="Captured per day, last 7 days, and where they came from." action={{ label: "Inbound Sources", view: "intake", onNavigate }} />
          <div className="perf__daily">
            {daily.map((d) => (
              <div key={d.label} className="perf__daily-col" title={`${d.count} leads`}>
                <span className="perf__daily-count">{d.count}</span>
                <div className="perf__daily-bar" style={{ height: `${(d.count / maxDaily) * 100}%` }} />
                <span className="perf__daily-label">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="perf__bars">
            {sources.map((s) => (
              <div key={s.source} className="perf__bar-row">
                <span className="perf__bar-label">{s.source}</span>
                <div className="perf__bar-track">
                  <div className="perf__bar-fill" style={{ width: `${(s.leads / maxSource) * 100}%` }} />
                </div>
                <span className="perf__bar-count">{s.leads}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="page-card">
          <SectionTitle title="Response & SLA" hint="How fast leads get a first touch, and compliance by tier." action={{ label: "Assignment & SLA", view: "assignment", onNavigate }} />
          <HTMLTable className="perf__table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Open</th>
                <th>On track</th>
                <th>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {sla.map((row) => (
                <tr key={row.tier}>
                  <td>
                    <PriorityTag priority={row.tier} />
                  </td>
                  <td>{row.open}</td>
                  <td>{row.onTrack}</td>
                  <td>
                    <div className="perf__inline-bar">
                      <div className="perf__inline-track">
                        <div className="perf__inline-fill" style={{ width: `${row.compliance}%`, background: row.compliance < 50 ? "#cd4246" : row.compliance < 80 ? "#c87619" : "#238551" }} />
                      </div>
                      <strong>{row.compliance}%</strong>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
          <p className="perf__note">
            <Icon icon="info-sign" size={11} /> Median first response {formatHours(summary.medianResponseHours)} across leads that have been touched. Hot leads have a 1h window, Warm 4h, Cold 24h.
          </p>
        </Card>
      </div>

      <Card className="page-card">
        <SectionTitle title="Rep performance" hint="Load, speed and conversion per owner. Click a rep to see their queue." />
        <HTMLTable className="perf__table" interactive>
          <thead>
            <tr>
              <th>Rep</th>
              <th>Open / cap</th>
              <th>Hot</th>
              <th>SLA breaches</th>
              <th>Median response</th>
              <th>Contacted</th>
              <th>Won</th>
              <th>Win rate</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reps.map((r) => (
              <tr key={r.rep}>
                <td>
                  <strong>{r.rep}</strong>
                </td>
                <td>
                  {r.open} / {r.capacity}
                </td>
                <td>{r.hot}</td>
                <td>{r.breaches > 0 ? <Tag minimal intent="danger">{r.breaches}</Tag> : <span className="perf__muted">0</span>}</td>
                <td>{formatHours(r.medianResponseHours)}</td>
                <td>{r.contacted}</td>
                <td>{r.won}</td>
                <td>
                  <strong>{r.winRate}%</strong>
                </td>
                <td className="perf__row-action">
                  <Button small minimal rightIcon="arrow-right" text="Queue" onClick={() => onViewRep(r.rep)} />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      <div className="perf__grid-2">
        <Card className="page-card">
          <SectionTitle title="Routing performance" hint="How much assignment the engine handles alone, and how often humans agree with it." action={{ label: "Assignment Rules", view: "assignment-rules", onNavigate }} />
          <div className="perf__stats">
            <div className="perf__stat">
              <span className="perf__stat-value">{summary.routing.autoAssigned}</span>
              <span className="perf__stat-label">Auto-assigned</span>
            </div>
            <div className="perf__stat">
              <span className="perf__stat-value">{summary.routing.humanDecided}</span>
              <span className="perf__stat-label">Human decisions</span>
            </div>
            <div className="perf__stat">
              <span className="perf__stat-value" style={{ color: summary.routing.acceptanceRate >= 80 ? "#238551" : "#c87619" }}>
                {summary.routing.acceptanceRate}%
              </span>
              <span className="perf__stat-label">Recommendation accepted</span>
            </div>
            <div className="perf__stat">
              <span className="perf__stat-value" style={{ color: summary.routing.unassigned > 0 ? "#cd4246" : "#238551" }}>
                {summary.routing.unassigned}
              </span>
              <span className="perf__stat-label">Waiting for owner</span>
            </div>
          </div>
          <p className="perf__note">
            {summary.routing.overridden > 0
              ? `${summary.routing.overridden} override${summary.routing.overridden === 1 ? "" : "s"} recorded — reasons are broken down under Prioritization Model → Model feedback.`
              : "No overrides recorded yet. Every accepted recommendation is a vote of confidence in the rules."}
          </p>
        </Card>

        <Card className="page-card">
          <SectionTitle title="Model performance" hint="Does a higher tier actually win more often?" action={{ label: "Prioritization Model", view: "prioritization-model", onNavigate }} />
          <div className="perf__tiers">
            {funnel.map((row) => (
              <div key={row.tier} className="perf__tier">
                <PriorityTag priority={row.tier} />
                <div className="perf__tier-bar-track">
                  <div className="perf__tier-bar-fill" style={{ width: `${Math.min(100, row.wonRate * 2)}%` }} />
                </div>
                <span className="perf__tier-rate">{row.wonRate}% won</span>
                <span className="perf__muted">
                  {row.won}/{row.predicted}
                </span>
              </div>
            ))}
          </div>
          <p className={`perf__note${summary.model.healthy ? "" : " perf__note--warn"}`}>
            <Icon icon={summary.model.healthy ? "tick-circle" : "warning-sign"} size={11} />{" "}
            {summary.model.healthy
              ? "Hot is out-converting Warm — prioritization is ordering work correctly."
              : `Warm (${summary.model.warmWonRate}%) is out-converting Hot (${summary.model.hotWonRate}%) — the Hot threshold or scoring weights need attention.`}
          </p>
        </Card>
      </div>

      <Card className="page-card">
        <SectionTitle title="Source quality" hint="Which channels produce leads worth the team's time." action={{ label: "Inbound Sources", view: "intake", onNavigate }} />
        <HTMLTable className="perf__table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Leads</th>
              <th>Hot share</th>
              <th>Won</th>
              <th>Win rate</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.source}>
                <td>{s.source}</td>
                <td>{s.leads}</td>
                <td>{s.hotShare}%</td>
                <td>{s.won}</td>
                <td>
                  <strong>{s.winRate}%</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>
    </div>
  );
}
