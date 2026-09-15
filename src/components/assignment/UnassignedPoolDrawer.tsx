import { useState } from "react";
import { Button, Drawer, HTMLSelect, NonIdealState } from "@blueprintjs/core";
import type { Lead, Priority } from "../../types";
import { getRepLoad } from "../../lib/capacity";
import { PriorityTag } from "../Tags";
import { SlaBadge } from "../SlaBadge";

const PRIORITY_ORDER: Record<Priority, number> = { Hot: 0, Warm: 1, Cold: 2 };

interface UnassignedPoolDrawerProps {
  isOpen: boolean;
  leads: Lead[];
  assigneeOptions: string[];
  onAssign: (leadId: string, assignee: string) => void;
  onAutoAssign: () => void;
  onClose: () => void;
}

export function UnassignedPoolDrawer({ isOpen, leads, assigneeOptions, onAssign, onAutoAssign, onClose }: UnassignedPoolDrawerProps) {
  const [choice, setChoice] = useState<Record<string, string>>({});
  const pool = leads
    .filter((l) => l.status !== "Lost" && l.assignedTo === null)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.score - a.score);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="520px" position="right" title="Unassigned pool" icon="people">
      <div className="unassigned-drawer">
        <div className="unassigned-drawer__intro">
          <p>
            {pool.length} open lead{pool.length === 1 ? "" : "s"} waiting for an owner. Pick a rep per lead, or let the active
            Assignment Rules decide.
          </p>
          <Button intent="primary" icon="flash" text={`Auto-assign by rules (${pool.length})`} disabled={pool.length === 0} onClick={onAutoAssign} />
        </div>

        {pool.length === 0 ? (
          <NonIdealState icon="tick-circle" title="Pool is empty" description="Every open lead has an owner." />
        ) : (
          <div className="unassigned-drawer__list">
            {pool.map((lead) => {
              const picked = choice[lead.id] ?? "";
              return (
                <div key={lead.id} className="unassigned-drawer__row">
                  <div className="unassigned-drawer__lead">
                    <div className="unassigned-drawer__name">{lead.name}</div>
                    <div className="unassigned-drawer__meta">
                      <span>{lead.company}</span>
                      <PriorityTag priority={lead.priority} />
                      <SlaBadge lead={lead} />
                    </div>
                  </div>
                  <HTMLSelect value={picked} onChange={(e) => setChoice({ ...choice, [lead.id]: e.target.value })}>
                    <option value="" disabled>
                      Select rep…
                    </option>
                    {assigneeOptions.map((rep) => {
                      const load = getRepLoad(leads, rep);
                      return (
                        <option key={rep} value={rep}>
                          {rep} ({load?.total ?? 0}/{load?.rep.capacity ?? 0})
                        </option>
                      );
                    })}
                  </HTMLSelect>
                  <Button small intent="primary" icon="tick" text="Assign" disabled={!picked} onClick={() => onAssign(lead.id, picked)} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}
