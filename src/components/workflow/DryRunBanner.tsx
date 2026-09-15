import { Button, Callout } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { DryRunLeadSelector } from "./DryRunLeadSelector";

interface DryRunBannerProps {
  leads: Lead[];
  selectedLeadId: string;
  onSelectLead: (leadId: string) => void;
  onRun: () => void;
  canRun: boolean;
}

export function DryRunBanner({ leads, selectedLeadId, onSelectLead, onRun, canRun }: DryRunBannerProps) {
  return (
    <Callout intent="primary" icon="lab-test" className="wf-dryrun-banner">
      <strong>Test Mode</strong> — simulating only. No leads will be modified, no notifications sent, no CRM writes performed.
      <div className="wf-dryrun-banner" style={{ marginTop: 8, marginBottom: 0 }}>
        <DryRunLeadSelector leads={leads} selectedLeadId={selectedLeadId} onChange={onSelectLead} />
        <Button intent="primary" icon="play" text="Run simulation" onClick={onRun} disabled={!canRun} />
      </div>
    </Callout>
  );
}
