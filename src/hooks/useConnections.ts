import { useState } from "react";
import { INITIAL_CONNECTIONS } from "../data/connections";
import type { CrmConnection } from "../types";
import { AppToaster } from "../lib/toaster";

type LogAction = (action: string, object: string, before?: string, after?: string) => void;

/** Owns CRM connections and the reconnect handler for the Connections page. Conflict resolution
 * stays in App.tsx (via the exposed `setConnections`) since it also has to touch lead writeback state. */
export function useConnections(logAction: LogAction) {
  const [connections, setConnections] = useState<CrmConnection[]>(INITIAL_CONNECTIONS);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);

  function handleReconnect(connectionId: string) {
    setReconnectingId(connectionId);
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) => (c.id === connectionId ? { ...c, status: "healthy", lastSyncAt: new Date().toISOString(), pendingCount: 0 } : c)),
      );
      setReconnectingId(null);
      const conn = connections.find((c) => c.id === connectionId);
      logAction("Reconnected integration", conn?.name ?? connectionId, "Disconnected", "Healthy");
      AppToaster.show({ icon: "tick-circle", intent: "success", message: `${conn?.name ?? "Connection"} reconnected.` });
    }, 1400);
  }

  return { connections, setConnections, reconnectingId, handleReconnect };
}
