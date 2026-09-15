import { useState } from "react";
import { Button, Callout, Card, H4, HTMLTable, Icon, RangeSlider, Tag } from "@blueprintjs/core";
import type { Lead, TierThresholds } from "../../types";
import { runThresholdDryRun } from "../../lib/thresholdDryRun";
import { PriorityTag } from "../Tags";

interface DryRunModelPanelProps {
  liveThresholds: TierThresholds;
  leads: Lead[];
  onApply: (thresholds: TierThresholds) => void;
}

export function DryRunModelPanel({ liveThresholds, leads, onApply }: DryRunModelPanelProps) {
  const [draft, setDraft] = useState<TierThresholds>(liveThresholds);
  const dirty = draft.hotMin !== liveThresholds.hotMin || draft.warmMin !== liveThresholds.warmMin;
  const result = runThresholdDryRun(leads, draft);

  return (
    <Card elevation={1} className="dry-run-panel">
      <div className="dry-run-panel__title-row">
        <H4>
          <Icon icon="lab-test" size={16} /> Threshold Dry-Run
        </H4>
        <span className="dry-run-panel__subtitle">
          Preview a threshold change against your current leads. Nothing is saved until you apply it.
        </span>
      </div>

      <p className="dry-run-panel__hint">
        Cold: 0–{draft.warmMin - 1} · Warm: {draft.warmMin}–{draft.hotMin - 1} · Hot: {draft.hotMin}–100
      </p>

      <div className="dry-run-panel__slider">
        <RangeSlider
          min={0}
          max={100}
          stepSize={1}
          labelStepSize={25}
          value={[draft.warmMin, draft.hotMin]}
          onChange={([warmMin, hotMin]) => setDraft({ warmMin, hotMin: Math.max(hotMin, warmMin + 1) })}
        />
      </div>

      {!dirty ? (
        <Callout icon="info-sign">Move the sliders to test a different cut-off.</Callout>
      ) : (
        <>
          <Callout intent={result.moves.length > 0 ? "warning" : "success"} icon={result.moves.length > 0 ? "warning-sign" : "tick"}>
            {result.moves.length === 0
              ? "No lead would change tier under this threshold."
              : `${result.moves.length} lead${result.moves.length === 1 ? "" : "s"} would change tier — ${result.upgrades} up, ${result.downgrades} down.`}
          </Callout>

          <HTMLTable className="dry-run-panel__table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Live count</th>
                <th>Live won %</th>
                <th>Simulated count</th>
                <th>Simulated won %</th>
              </tr>
            </thead>
            <tbody>
              {result.current.map((row, i) => {
                const sim = result.simulated[i];
                const delta = sim.wonRate - row.wonRate;
                return (
                  <tr key={row.tier}>
                    <td>
                      <PriorityTag priority={row.tier} />
                    </td>
                    <td>{row.count}</td>
                    <td>{row.wonRate}%</td>
                    <td>{sim.count}</td>
                    <td>
                      {sim.wonRate}%{" "}
                      {delta !== 0 && (
                        <span className={`dry-run-panel__delta dry-run-panel__delta--${delta > 0 ? "up" : "down"}`}>
                          {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </HTMLTable>

          {result.moves.length > 0 && (
            <div className="dry-run-panel__moves">
              {result.moves.slice(0, 6).map((m) => (
                <div key={m.lead.id} className="dry-run-panel__move-row">
                  <span className="dry-run-panel__move-name">{m.lead.name}</span>
                  <PriorityTag priority={m.currentTier} />
                  <Icon icon="arrow-right" size={11} />
                  <PriorityTag priority={m.simulatedTier} />
                  <Tag minimal intent={m.direction === "up" ? "success" : "warning"} round>
                    {m.direction === "up" ? "Up" : "Down"}
                  </Tag>
                  {m.lead.outcome && <span className="dry-run-panel__move-outcome">{m.lead.outcome}</span>}
                </div>
              ))}
              {result.moves.length > 6 && <p className="dry-run-panel__more">+{result.moves.length - 6} more</p>}
            </div>
          )}
        </>
      )}

      <div className="dry-run-panel__actions">
        <Button minimal text="Reset to live" disabled={!dirty} onClick={() => setDraft(liveThresholds)} />
        <Button intent="primary" icon="tick" text="Apply to live thresholds" disabled={!dirty} onClick={() => onApply(draft)} />
      </div>
    </Card>
  );
}
