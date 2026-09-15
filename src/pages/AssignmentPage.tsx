import { useState } from "react";
import type { Lead } from "../types";
import { CapacityHeatmap } from "../components/assignment/CapacityHeatmap";
import { SlaRiskPanel } from "../components/assignment/SlaRiskPanel";
import { UnassignedPoolDrawer } from "../components/assignment/UnassignedPoolDrawer";
import { PageHeader } from "../components/PageHeader";

interface AssignmentPageProps {
  leads: Lead[];
  assigneeOptions: string[];
  onOpenLead: (leadId: string) => void;
  onAssign: (leadId: string, assignee: string) => void;
  onAutoAssign: () => void;
}

export function AssignmentPage({ leads, assigneeOptions, onOpenLead, onAssign, onAutoAssign }: AssignmentPageProps) {
  const [poolOpen, setPoolOpen] = useState(false);

  return (
    <div className="assignment-page">
      <PageHeader
        title="Assignment & SLA"
        description="Rep load against capacity, and every lead approaching or past its response window. Assign from the pool here; the rules that drive auto-assignment live under Automation → Assignment Rules."
      />
      <CapacityHeatmap leads={leads} onAssignUnassigned={() => setPoolOpen(true)} />
      <SlaRiskPanel leads={leads} onOpenLead={onOpenLead} />
      <UnassignedPoolDrawer
        isOpen={poolOpen}
        leads={leads}
        assigneeOptions={assigneeOptions}
        onAssign={onAssign}
        onAutoAssign={onAutoAssign}
        onClose={() => setPoolOpen(false)}
      />
    </div>
  );
}
