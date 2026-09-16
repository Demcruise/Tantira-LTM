import { Button, Icon, Tag, Tooltip } from "@blueprintjs/core";
import type { SyncConflict } from "../../types";

interface ConflictDiffViewProps {
  conflict: SyncConflict;
  connectionName?: string;
  onResolve: (resolution: "keep_crm" | "keep_tantira" | "merge") => void;
  onOpenLead?: () => void;
}

export function ConflictDiffView({ conflict, connectionName, onResolve, onOpenLead }: ConflictDiffViewProps) {
  return (
    <div className="conflict-diff-view">
      <div className="conflict-diff-view__header">
        <span className="conflict-diff-view__lead">{conflict.leadName}</span>
        <Tag minimal>{conflict.field}</Tag>
        {onOpenLead && <Button small minimal icon="document-open" text="Open lead" onClick={onOpenLead} className="conflict-diff-view__open" />}
      </div>

      <p className="conflict-diff-view__provenance">
        <Icon icon="info-sign" size={11} />
        {connectionName ?? "The CRM"} changed <strong>{conflict.field}</strong> after Tantira's last sync — both sides now hold a different value, so the
        sync is paused for this lead until you pick one.
      </p>

      <div className="conflict-diff-view__values">
        <div className="conflict-diff-view__value">
          <span>In CRM</span>
          <strong>{conflict.crmValue}</strong>
        </div>
        <div className="conflict-diff-view__value">
          <span>In Tantira</span>
          <strong>{conflict.tantiraValue}</strong>
        </div>
      </div>

      <div className="conflict-diff-view__actions">
        <Tooltip content="Tantira adopts the CRM value, then the sync resumes.">
          <Button small text="Keep CRM" onClick={() => onResolve("keep_crm")} />
        </Tooltip>
        <Tooltip content="Tantira's value overwrites the CRM, then sync resumes.">
          <Button small text="Keep Tantira" onClick={() => onResolve("keep_tantira")} />
        </Tooltip>
        <Tooltip content="CRM value wins the field; Tantira's value is kept as a note on the lead.">
          <Button small intent="primary" text="Merge" onClick={() => onResolve("merge")} />
        </Tooltip>
      </div>
    </div>
  );
}
