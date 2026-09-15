import { useState } from "react";
import { Button, Callout, HTMLSelect } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { getRepLoad, loadColor } from "../../lib/capacity";
import { SlaTimestampBreakdown } from "./SlaTimestampBreakdown";

interface AssignmentPanelProps {
  lead: Lead;
  leads: Lead[];
  assigneeOptions: string[];
  onAssign: (leadId: string, repName: string) => void;
}

export function AssignmentPanel({ lead, leads, assigneeOptions, onAssign }: AssignmentPanelProps) {
  const [pendingRep, setPendingRep] = useState<string>(lead.assignedTo ?? "");

  const preview = pendingRep ? getRepLoad(leads, pendingRep) : undefined;
  const wouldExceed = preview ? preview.total + (pendingRep === lead.assignedTo ? 0 : 1) > preview.rep.capacity : false;
  const isChange = pendingRep !== "" && pendingRep !== lead.assignedTo;

  function cancel() {
    setPendingRep(lead.assignedTo ?? "");
  }

  return (
    <div className="assignment-panel">
      <SlaTimestampBreakdown lead={lead} />

      <HTMLSelect fill value={pendingRep} onChange={(e) => setPendingRep(e.target.value)}>
        <option value="" disabled>
          Select owner…
        </option>
        {assigneeOptions.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </HTMLSelect>

      {preview && (
        <div className="assignment-panel__preview" style={{ color: loadColor(preview.ratio) }}>
          {preview.rep.name}: {preview.total} / {preview.rep.capacity} assigned
        </div>
      )}

      {isChange && wouldExceed && (
        <Callout intent="warning" icon="warning-sign" title="Rep at capacity — confirm before assigning">
          Assigning here pushes {preview?.rep.name} over their capacity.
        </Callout>
      )}

      {isChange && wouldExceed && (
        <div className="assignment-panel__confirm-row">
          <Button minimal icon="cross" text="Cancel" onClick={cancel} />
          <Button intent="warning" icon="warning-sign" text="Assign anyway" onClick={() => onAssign(lead.id, pendingRep)} />
        </div>
      )}

      {isChange && !wouldExceed && (
        <Button intent="primary" icon="tick" text="Assign" onClick={() => onAssign(lead.id, pendingRep)} />
      )}
    </div>
  );
}
