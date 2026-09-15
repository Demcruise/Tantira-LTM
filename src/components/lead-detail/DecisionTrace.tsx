import { useState } from "react";
import { Icon, Tag } from "@blueprintjs/core";
import type { RecommendationDecision } from "../../types";
import { ConfidenceMeter } from "../ConfidenceMeter";

export function DecisionTrace({ decision }: { decision: RecommendationDecision }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="decision-trace">
      <button type="button" className="decision-trace__toggle" onClick={() => setOpen(!open)}>
        <Icon icon={open ? "chevron-up" : "chevron-down"} size={11} />
        View decision trace
      </button>

      {open && (
        <div className="decision-trace__body">
          <div className="decision-trace__row">
            <span className="decision-trace__label">Confidence at decision time</span>
            <ConfidenceMeter value={decision.confidence} />
          </div>
          <div className="decision-trace__row">
            <span className="decision-trace__label">Basis</span>
            <span className="decision-trace__value">{decision.basis}</span>
          </div>
          {decision.signals.length > 0 && (
            <div className="decision-trace__row">
              <span className="decision-trace__label">Input signals</span>
              <div className="decision-trace__signals">
                {decision.signals.map((s) => (
                  <Tag key={s} minimal round>
                    {s}
                  </Tag>
                ))}
              </div>
            </div>
          )}
          {decision.status === "overridden" && (
            <div className="decision-trace__row">
              <span className="decision-trace__label">Override reason</span>
              <span className="decision-trace__value">{decision.reason}</span>
            </div>
          )}
          <div className="decision-trace__row">
            <span className="decision-trace__label">Decided</span>
            <span className="decision-trace__value">
              {decision.decidedBy} · {new Date(decision.decidedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
