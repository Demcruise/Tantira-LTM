import { Classes, Dialog, NonIdealState } from "@blueprintjs/core";
import type { ConflictResolution, CrmConnection } from "../../types";
import { ConflictDiffView } from "./ConflictDiffView";

interface ConflictsDialogProps {
  connection: CrmConnection | null;
  onClose: () => void;
  onResolve: (connectionId: string, conflictId: string, resolution: ConflictResolution) => void;
  onOpenLead: (leadId: string) => void;
}

export function ConflictsDialog({ connection, onClose, onResolve, onOpenLead }: ConflictsDialogProps) {
  return (
    <Dialog isOpen={connection !== null} onClose={onClose} title={connection ? `${connection.name} — Sync Conflicts` : ""} icon="git-branch">
      <div className={Classes.DIALOG_BODY}>
        {connection && connection.conflicts.length === 0 && (
          <NonIdealState icon="tick-circle" title="No conflicts" description="All records are in sync." />
        )}
        {connection && (
          <div className="conflicts-dialog__list">
            {connection.conflicts.map((c) => (
              <ConflictDiffView
                key={c.id}
                conflict={c}
                connectionName={connection.name}
                onResolve={(resolution) => onResolve(connection.id, c.id, resolution)}
                onOpen={() => onOpenLead(c.leadId)}
              />
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
