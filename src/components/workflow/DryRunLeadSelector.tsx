import { HTMLSelect } from "@blueprintjs/core";
import type { Lead } from "../../types";

interface DryRunLeadSelectorProps {
  leads: Lead[];
  selectedLeadId: string;
  onChange: (leadId: string) => void;
}

export function DryRunLeadSelector({ leads, selectedLeadId, onChange }: DryRunLeadSelectorProps) {
  return (
    <HTMLSelect
      className="wf-dryrun-banner__lead-select"
      value={selectedLeadId}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select a lead to simulate…
      </option>
      {leads.map((lead) => (
        <option key={lead.id} value={lead.id}>
          {lead.name} — {lead.company}
        </option>
      ))}
    </HTMLSelect>
  );
}
