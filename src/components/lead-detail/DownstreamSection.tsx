import { Icon } from "@blueprintjs/core";
import type { DownstreamSequence } from "../../types";
import { sequenceProgress } from "../../lib/downstream";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function DownstreamSection({ sequence }: { sequence: DownstreamSequence }) {
  const p = sequenceProgress(sequence);
  return (
    <div className="downstream">
      <div className="downstream__meta">
        <span>
          Run by <strong>{p.def.owner}</strong> · started {formatTime(sequence.startedAt)}
        </span>
        <span className="downstream__progress">
          {p.completed}/{p.total} steps
        </span>
      </div>
      <div className="downstream__bar">
        <div className="downstream__bar-fill" style={{ width: `${(p.completed / p.total) * 100}%` }} />
      </div>
      <ol className="downstream__steps">
        {p.def.steps.map((step, i) => {
          const done = i < p.completed;
          const next = i === p.completed;
          return (
            <li key={step} className={`downstream__step${done ? " downstream__step--done" : next ? " downstream__step--next" : ""}`}>
              <Icon icon={done ? "tick-circle" : next ? "time" : "circle"} size={12} />
              <span>{step}</span>
              <span className="downstream__step-time">{done ? formatTime(p.stepTimes[i]) : next && p.nextDueAt ? `due ${formatTime(p.nextDueAt)}` : ""}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
