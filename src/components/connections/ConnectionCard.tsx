import { Button, Card, Icon, Tag } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { ConnectionStatus, CrmConnection } from "../../types";

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

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

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
