import { Button, Callout, Spinner } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { relativeTime } from "../../lib/relativeTime";

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
