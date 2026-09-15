import { Callout, Card, H4, HTMLTable, Icon } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { buildTierFunnel, decisionStats, feedbackInsight, outcomeReasonBreakdown, overrideBreakdown } from "../../lib/feedback";
import { PriorityTag } from "../Tags";

function Bars({ rows, color }: { rows: { reason: string; count: number }[]; color: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return <p className="model-feedback__empty">No data yet.</p>;
  return (
    <div className="model-feedback__bars">
      {rows.map((r) => (
        <div key={r.reason} className="model-feedback__bar-row">
          <span className="model-feedback__bar-label">{r.reason}</span>
          <div className="model-feedback__bar-track">
            <div className="model-feedback__bar-fill" style={{ width: `${(r.count / max) * 100}%`, background: color }} />
          </div>
          <span className="model-feedback__bar-count">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

export function ModelFeedbackPanel({ leads }: { leads: Lead[] }) {
  const funnel = buildTierFunnel(leads);
  const overrides = overrideBreakdown(leads);
  const lost = outcomeReasonBreakdown(leads, "Lost");
  const won = outcomeReasonBreakdown(leads, "Won");
  const decisions = decisionStats(leads);
  const insight = feedbackInsight(leads);

  return (
    <Card elevation={1} className="model-feedback">
      <div className="model-feedback__title-row">
        <H4>Model feedback</H4>
        <span className="model-feedback__subtitle">What actually happened to each predicted tier, and where humans disagreed with the engine.</span>
      </div>

      {insight && (
        <Callout intent="primary" icon="lightbulb" title="Suggested tuning">
          {insight}
        </Callout>
      )}

      <HTMLTable className="model-feedback__table">
        <thead>
          <tr>
            <th>Predicted</th>
            <th>Leads</th>
            <th>Assigned</th>
            <th>Contacted</th>
            <th>Qualified</th>
            <th>Won</th>
            <th>Lost</th>
            <th>Tier → Won</th>
          </tr>
        </thead>
        <tbody>
          {funnel.map((row) => (
            <tr key={row.tier}>
              <td>
                <PriorityTag priority={row.tier} />
              </td>
              <td>{row.predicted}</td>
              <td>{row.assigned}</td>
              <td>{row.contacted}</td>
              <td>{row.qualified}</td>
              <td className="model-feedback__won">{row.won}</td>
              <td className="model-feedback__lost">{row.lost}</td>
              <td>
                <strong>{row.wonRate}%</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
      <p className="model-feedback__note">
        <Icon icon="info-sign" size={11} /> A healthy model converts Hot &gt; Warm &gt; Cold. If a lower tier out-converts a higher one, thresholds or scoring rules need attention.
      </p>

      <div className="model-feedback__grid">
        <div>
          <div className="model-feedback__section-title">
            Owner overrides <span className="model-feedback__pill">{decisions.acceptanceRate}% accepted</span>
          </div>
          <Bars rows={overrides} color="#c87619" />
        </div>
        <div>
          <div className="model-feedback__section-title">Why leads were lost</div>
          <Bars rows={lost} color="#cd4246" />
        </div>
        <div>
          <div className="model-feedback__section-title">Why leads were won</div>
          <Bars rows={won} color="#238551" />
        </div>
      </div>
    </Card>
  );
}
