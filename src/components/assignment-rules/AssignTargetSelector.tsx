import { Checkbox, HTMLSelect } from "@blueprintjs/core";
import { QUEUES, REP_NAMES } from "../../data/assignmentRules";
import type { AssignTarget, AssignTargetType } from "../../types";

interface AssignTargetSelectorProps {
  target: AssignTarget;
  onChange: (target: AssignTarget) => void;
}

export function AssignTargetSelector({ target, onChange }: AssignTargetSelectorProps) {
  function setType(type: AssignTargetType) {
    if (type === "rep") onChange({ type, repId: REP_NAMES[0], capacityAware: target.capacityAware });
    else if (type === "queue") onChange({ type, queueId: QUEUES[0].id, capacityAware: target.capacityAware });
    else onChange({ type, roundRobinGroup: [REP_NAMES[0]], capacityAware: target.capacityAware });
  }

  return (
    <div className="assign-target-selector">
      <HTMLSelect value={target.type} onChange={(e) => setType(e.target.value as AssignTargetType)}>
        <option value="rep">Specific rep</option>
        <option value="queue">Queue</option>
        <option value="round_robin">Round-robin group</option>
      </HTMLSelect>

      {target.type === "rep" && (
        <HTMLSelect value={target.repId} onChange={(e) => onChange({ ...target, repId: e.target.value })}>
          {REP_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </HTMLSelect>
      )}

      {target.type === "queue" && (
        <HTMLSelect value={target.queueId} onChange={(e) => onChange({ ...target, queueId: e.target.value })}>
          {QUEUES.map((q) => (
            <option key={q.id} value={q.id}>
              {q.name}
            </option>
          ))}
        </HTMLSelect>
      )}

      {target.type === "round_robin" && (
        <div className="assign-target-selector__group">
          {REP_NAMES.map((name) => {
            const checked = target.roundRobinGroup?.includes(name) ?? false;
            return (
              <Checkbox
                key={name}
                label={name}
                checked={checked}
                onChange={() => {
                  const group = target.roundRobinGroup ?? [];
                  const next = checked ? group.filter((n) => n !== name) : [...group, name];
                  onChange({ ...target, roundRobinGroup: next });
                }}
              />
            );
          })}
        </div>
      )}

      <Checkbox
        label="Respect rep capacity"
        checked={target.capacityAware}
        onChange={() => onChange({ ...target, capacityAware: !target.capacityAware })}
      />
    </div>
  );
}
