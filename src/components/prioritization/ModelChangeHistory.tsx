import { useState } from "react";
import { Button, Collapse, Icon } from "@blueprintjs/core";
import type { AuditLogEntry } from "../../types";

function actorLabel(entry: AuditLogEntry): string {
  return entry.actor.type === "system" ? "System" : entry.actor.name;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ModelChangeHistory({ entries }: { entries: AuditLogEntry[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="model-change-history">
      <Button
        minimal
        alignText="left"
        icon={open ? "chevron-down" : "chevron-right"}
        text={`Change history (${entries.length})`}
        onClick={() => setOpen(!open)}
      />
      <Collapse isOpen={open}>
        <div className="model-change-history__list">
          {entries.length === 0 && <p className="model-change-history__empty">No changes yet.</p>}
          {entries.map((e) => (
            <div key={e.id} className="model-change-history__entry">
              <Icon icon={e.actor.type === "system" ? "cog" : "person"} size={12} />
              <div>
                <div className="model-change-history__entry-line">
                  <strong>{actorLabel(e)}</strong> {e.action.toLowerCase()}
                  {e.object ? ` — ${e.object}` : ""}
                </div>
                {(e.before || e.after) && (
                  <div className="model-change-history__entry-diff">
                    {e.before && <span className="model-change-history__before">{e.before}</span>}
                    {e.before && e.after && " → "}
                    {e.after && <span className="model-change-history__after">{e.after}</span>}
                  </div>
                )}
                <div className="model-change-history__entry-time">{formatTime(e.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  );
}
