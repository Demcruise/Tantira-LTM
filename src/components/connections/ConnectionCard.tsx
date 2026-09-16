import { Button, Card, Icon, Tag } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { ConnectionStatus, CrmConnection } from "../../types";
import { relativeTime } from "../../lib/relativeTime";

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; intent: "success" | "warning" | "danger"; icon: "tick-circle" | "warning-sign" | "offline" }> = {
  healthy: { label: "Healthy", intent: "success", icon: "tick-circle" },
  degraded: { label: "Degraded", intent: "warning", icon: "warning-sign" },
  disconnected: { label: "Disconnected", intent: "danger", icon: "offline" },
};

const PROVIDER_ICON: Record<string, IconName> = {
  salesforce: "cloud",
  hubspot: "diagram-tree",
  monday: "grid-view",
};

interface ConnectionCardProps {
  connection: CrmConnection;
  onViewConflicts: () => void;
  onReconnect: () => void;
  reconnecting: boolean;
}

export function ConnectionCard({ connection, onViewConflicts, onReconnect, reconnecting }: ConnectionCardProps) {
  const status = STATUS_CONFIG[connection.status];
  const isDisconnected = connection.status === "disconnected";

  return (
    <Card elevation={1} className={`connection-card connection-card--${connection.status}`}>
      <div className="connection-card__header">
        <div className="connection-card__identity">
          <span className="connection-card__icon">
            <Icon icon={PROVIDER_ICON[connection.id] ?? "cloud"} size={18} />
          </span>
          <span className="connection-card__name">{connection.name}</span>
        </div>
        <Tag minimal intent={status.intent} icon={status.icon}>
          {status.label}
        </Tag>
      </div>

      <div className="connection-card__stats">
        <div className="connection-card__stat">
          <span className="connection-card__stat-label">{isDisconnected ? "Last successful sync" : "Last sync"}</span>
          <span className="connection-card__stat-value">{relativeTime(connection.lastSyncAt)}</span>
        </div>
        <div className="connection-card__stat">
          <span className="connection-card__stat-label">Pending writes</span>
          <span className="connection-card__stat-value">{isDisconnected ? "—" : connection.pendingCount}</span>
        </div>
        <div className="connection-card__stat">
          <span className="connection-card__stat-label">Open conflicts</span>
          <span className="connection-card__stat-value">{isDisconnected ? "—" : connection.conflicts.length}</span>
        </div>
      </div>

      <div className="connection-card__actions">
        {isDisconnected ? (
          <Button
            small
            intent="primary"
            icon="refresh"
            text={reconnecting ? "Reconnecting…" : "Reconnect"}
            loading={reconnecting}
            onClick={onReconnect}
            fill
          />
        ) : (
          <Button
            small
            minimal
            icon="git-branch"
            text={`View conflicts (${connection.conflicts.length})`}
            onClick={onViewConflicts}
            disabled={connection.conflicts.length === 0}
            fill
          />
        )}
      </div>
    </Card>
  );
}
