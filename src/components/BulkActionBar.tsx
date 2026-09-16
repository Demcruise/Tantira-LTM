import { useState } from "react";
import { Button, HTMLSelect, Icon } from "@blueprintjs/core";
import type { Priority } from "../types";

export type BulkAction =
  | { type: "assign"; assignee: string }
  | { type: "priority"; priority: Priority }
  | { type: "snooze" }
  | { type: "nurture" }
  | { type: "reprocess" }
  | { type: "export" };

interface BulkActionBarProps {
  count: number;
  assigneeOptions: string[];
  onAction: (action: BulkAction) => void;
  onClear: () => void;
}

export function BulkActionBar({ count, assigneeOptions, onAction, onClear }: BulkActionBarProps) {
  const [assignee, setAssignee] = useState(assigneeOptions[0] ?? "");
  const [priority, setPriority] = useState<Priority>("Hot");

  return (
    <div className="bulk-bar" role="toolbar" aria-label="Bulk actions">
      <div className="bulk-bar__count">
        <Icon icon="tick-circle" size={13} />
        <strong>{count}</strong> selected
        <Button small minimal text="Clear" onClick={onClear} />
      </div>

      <div className="bulk-bar__group">
        <HTMLSelect value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          {assigneeOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </HTMLSelect>
        <Button small intent="primary" icon="person" text="Assign" onClick={() => onAction({ type: "assign", assignee })} />
      </div>

      <div className="bulk-bar__group">
        <HTMLSelect value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option value="Hot">Hot</option>
          <option value="Warm">Warm</option>
          <option value="Cold">Cold</option>
        </HTMLSelect>
        <Button small icon="flame" text="Set priority" onClick={() => onAction({ type: "priority", priority })} />
      </div>

      <div className="bulk-bar__group">
        <Button small icon="moon" text="Snooze 1d" onClick={() => onAction({ type: "snooze" })} />
        <Button small icon="send-to" text="Nurture" onClick={() => onAction({ type: "nurture" })} />
        <Button small icon="refresh" text="Reprocess" title="Re-run enrichment, re-tier against current thresholds and retry pending CRM syncs" onClick={() => onAction({ type: "reprocess" })} />
        <Button small minimal icon="export" text="Export CSV" onClick={() => onAction({ type: "export" })} />
      </div>
    </div>
  );
}
