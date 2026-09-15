import { Button, Callout, Spinner } from "@blueprintjs/core";
import type { Lead } from "../../types";

function relativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

interface WritebackStatusProps {
  lead: Lead;
  onRetry: (leadId: string) => void;
}

export function WritebackStatus({ lead, onRetry }: WritebackStatusProps) {
  if (lead.writebackState === "idle") return null;

  if (lead.writebackState === "syncing") {
    return (
      <div className="writeback-status writeback-status--syncing">
        <Spinner size={16} />
        <span>Syncing to CRM…</span>
      </div>
    );
  }

  if (lead.writebackState === "synced") {
    return (
      <div className="writeback-status writeback-status--synced">
        <span className="writeback-status__icon">✓</span>
        <span>Synced {lead.syncedAt ? relativeTime(lead.syncedAt) : ""}</span>
      </div>
    );
  }

  return (
    <Callout intent="danger" icon="error" title="Sync failed">
      <div className="writeback-status__fail-row">
        <span>Could not write this lead back to the CRM.</span>
        <Button small intent="danger" icon="refresh" text="Retry" onClick={() => onRetry(lead.id)} />
      </div>
    </Callout>
  );
}
