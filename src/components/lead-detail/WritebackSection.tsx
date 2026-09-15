import type { ConflictResolution, Lead, SyncConflict } from "../../types";
import { WritebackStatus } from "./WritebackStatus";
import { ConflictDiffView } from "../connections/ConflictDiffView";

interface WritebackSectionProps {
  lead: Lead;
  conflict: (SyncConflict & { connectionId: string; connectionName: string }) | null;
  onRetry: (leadId: string) => void;
  onResolveConflict: (connectionId: string, conflictId: string, resolution: ConflictResolution) => void;
}

export function WritebackSection({ lead, conflict, onRetry, onResolveConflict }: WritebackSectionProps) {
  if (conflict) {
    return (
      <div className="writeback-section">
        <p className="writeback-section__hint">Sync conflict from {conflict.connectionName}:</p>
        <ConflictDiffView conflict={conflict} onResolve={(resolution) => onResolveConflict(conflict.connectionId, conflict.id, resolution)} />
      </div>
    );
  }

  return <WritebackStatus lead={lead} onRetry={onRetry} />;
}
