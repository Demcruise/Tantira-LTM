import { Button, Card, H4, HTMLTable, Tag } from "@blueprintjs/core";
import type { Lead, Priority } from "../../types";
import { REPS } from "../../data/reps";
import { getOpenLeads, loadColor, loadBg } from "../../lib/capacity";

const PRIORITIES: Priority[] = ["Hot", "Warm", "Cold"];
const PRIORITY_INTENT: Record<Priority, "danger" | "warning" | "primary"> = { Hot: "danger", Warm: "warning", Cold: "primary" };

interface CapacityHeatmapProps {
  leads: Lead[];
  onAssignUnassigned: () => void;
}

export function CapacityHeatmap({ leads, onAssignUnassigned }: CapacityHeatmapProps) {
  const openLeads = getOpenLeads(leads);

  const rows = REPS.map((rep) => {
    const assigned = openLeads.filter((l) => l.assignedTo === rep.name);
    const byPriority = Object.fromEntries(
      PRIORITIES.map((p) => [p, assigned.filter((l) => l.priority === p).length]),
    ) as Record<Priority, number>;
    const total = assigned.length;
    const ratio = total / rep.capacity;
    return { rep, byPriority, total, ratio };
  });

  const unassignedCount = openLeads.filter((l) => l.assignedTo === null).length;
  const totalCapacity = REPS.reduce((sum, r) => sum + r.capacity, 0);
  const totalAssigned = rows.reduce((sum, r) => sum + r.total, 0);

  return (
    <Card elevation={1} className="capacity-heatmap">
      <div className="capacity-heatmap__header">
        <H4>Rep Capacity</H4>
        <span className="capacity-heatmap__header-summary">
          {totalAssigned} / {totalCapacity} team capacity used
        </span>
      </div>

      <HTMLTable className="capacity-heatmap__table" interactive>
        <thead>
          <tr>
            <th>Rep</th>
            <th>Open leads by priority</th>
            <th>Load</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ rep, byPriority, total, ratio }) => (
            <tr key={rep.name}>
              <td className="capacity-heatmap__rep">{rep.name}</td>
              <td>
                <div className="capacity-heatmap__priority-tags">
                  {PRIORITIES.map((p) =>
                    byPriority[p] > 0 ? (
                      <Tag key={p} minimal intent={PRIORITY_INTENT[p]}>
                        {byPriority[p]} {p}
                      </Tag>
                    ) : null,
                  )}
                  {total === 0 && <span className="capacity-heatmap__no-leads">No open leads</span>}
                </div>
              </td>
              <td>
                <div className="capacity-heatmap__load-cell">
                  <div className="capacity-heatmap__load-bar-track">
                    <div
                      className="capacity-heatmap__load-bar-fill"
                      style={{ width: `${Math.min(ratio, 1) * 100}%`, background: loadColor(ratio) }}
                    />
                  </div>
                  <span className="capacity-heatmap__load-text" style={{ color: loadColor(ratio) }}>
                    {total} / {rep.capacity}
                  </span>
                </div>
              </td>
            </tr>
          ))}
          <tr className="capacity-heatmap__unassigned-row">
            <td className="capacity-heatmap__rep">Unassigned pool</td>
            <td>{unassignedCount > 0 ? `${unassignedCount} leads waiting` : "—"}</td>
            <td>
              <div className="capacity-heatmap__unassigned-cell">
                <div
                  className="capacity-heatmap__load"
                  style={{
                    background: loadBg(unassignedCount > 0 ? 1 : 0),
                    color: loadColor(unassignedCount > 0 ? 1 : 0),
                  }}
                >
                  {unassignedCount > 0 ? "needs assignment" : "all clear"}
                </div>
                {unassignedCount > 0 && (
                  <Button small intent="primary" icon="person" text="Assign leads" onClick={onAssignUnassigned} />
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </HTMLTable>
    </Card>
  );
}
