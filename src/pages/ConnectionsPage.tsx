import { useState } from "react";
import type { ConflictResolution, CrmConnection } from "../types";
import { PageHeader } from "../components/PageHeader";
import { ConnectionCard } from "../components/connections/ConnectionCard";
import { ConflictsDialog } from "../components/connections/ConflictsDialog";
import { KpiCard } from "../components/KpiRow";

interface ConnectionsPageProps {
  connections: CrmConnection[];
  reconnectingId: string | null;
  onReconnect: (connectionId: string) => void;
  onResolveConflict: (connectionId: string, conflictId: string, resolution: ConflictResolution) => void;
  onOpenLead: (leadId: string) => void;
}

export function ConnectionsPage({ connections, reconnectingId, onReconnect, onResolveConflict, onOpenLead }: ConnectionsPageProps) {
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewingConnection = connections.find((c) => c.id === viewingId) ?? null;

  const healthy = connections.filter((c) => c.status === "healthy").length;
  const degraded = connections.filter((c) => c.status === "degraded").length;
  const disconnected = connections.filter((c) => c.status === "disconnected").length;
  const totalConflicts = connections.reduce((sum, c) => sum + c.conflicts.length, 0);
  const totalPending = connections.reduce((sum, c) => sum + c.pendingCount, 0);

  return (
    <div className="connections-page">
      <PageHeader
        section="Connect"
        title="Connections"
        description="Sync health for every connected CRM. A conflict appears when the CRM edits a field after Tantira wrote it; resolving it resumes writeback for that lead and clears it from the Attention Center."
      />

      <div className="kpi-row connections-page__kpis">
        <KpiCard label="Healthy" value={healthy} icon="tick-circle" intent="success" />
        <KpiCard label="Degraded" value={degraded} icon="warning-sign" intent={degraded > 0 ? "warning" : undefined} />
        <KpiCard label="Disconnected" value={disconnected} icon="offline" intent={disconnected > 0 ? "danger" : undefined} />
        <KpiCard label="Open Conflicts" value={totalConflicts} icon="git-branch" intent={totalConflicts > 0 ? "warning" : undefined} />
        <KpiCard label="Pending Writes" value={totalPending} icon="cloud-upload" intent="primary" />
      </div>

      <div className="connections-page__list">
        {connections.map((c) => (
          <ConnectionCard
            key={c.id}
            connection={c}
            onViewConflicts={() => setViewingId(c.id)}
            onReconnect={() => onReconnect(c.id)}
            reconnecting={reconnectingId === c.id}
          />
        ))}
      </div>

      <ConflictsDialog
        connection={viewingConnection}
        onClose={() => setViewingId(null)}
        onResolve={onResolveConflict}
        onOpenLead={(leadId) => {
          setViewingId(null);
          onOpenLead(leadId);
        }}
      />
    </div>
  );
}
