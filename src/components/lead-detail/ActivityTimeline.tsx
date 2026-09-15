import { Icon } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { buildTimeline } from "../../lib/timeline";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityTimeline({ lead }: { lead: Lead }) {
  const events = buildTimeline(lead);

  return (
    <div className="activity-timeline">
      {events.map((event, i) => (
        <div key={i} className="activity-timeline__row">
          <div className="activity-timeline__marker">
            <span className="activity-timeline__dot">
              <Icon icon={event.icon} size={11} />
            </span>
            {i < events.length - 1 && <span className="activity-timeline__line" />}
          </div>
          <div className="activity-timeline__content">
            <div className="activity-timeline__label">{event.label}</div>
            {event.detail && <div className="activity-timeline__detail">{event.detail}</div>}
            <div className="activity-timeline__time">{formatTime(event.time)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
