import { Icon } from "@blueprintjs/core";
import type { Lead } from "../../types";
import type { LeadRecommendation } from "../../lib/recommendation";
import { buildLeadBrief } from "../../lib/leadBrief";

interface AiAnalysisPanelProps {
  lead: Lead;
  leads: Lead[];
  recommendation: LeadRecommendation | null;
}

export function AiAnalysisPanel({ lead, leads, recommendation }: AiAnalysisPanelProps) {
  const brief = buildLeadBrief(lead, leads, recommendation);

  return (
    <div className="ai-brief">
      <div className="ai-brief__header">
        <Icon icon="lightbulb" size={14} />
        <span>AI Analysis</span>
      </div>
      <p className="ai-brief__summary">{brief.summary}</p>
      <div className="ai-brief__row">
        <span className="ai-brief__label">Signals</span>
        <div className="ai-brief__signals">
          {brief.signals.map((s) => (
            <span key={s} className="ai-brief__signal">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="ai-brief__row">
        <span className="ai-brief__label">Recommendation</span>
        <span className="ai-brief__value">{brief.recommendationText}</span>
      </div>
      <div className="ai-brief__row">
        <span className="ai-brief__label">Why</span>
        <span className="ai-brief__value ai-brief__value--muted">{brief.why}</span>
      </div>
      <div className="ai-brief__next">
        <Icon icon="arrow-right" size={12} />
        <span>{brief.nextAction}</span>
      </div>
    </div>
  );
}
