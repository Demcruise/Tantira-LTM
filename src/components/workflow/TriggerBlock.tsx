import { BlockShell } from "./BlockShell";
import type { NodeStatus } from "../../lib/dryRun";

interface TriggerBlockProps {
  name: string;
  eventLabel: string;
  source: string;
  dryRunStatus?: NodeStatus;
  dryRunDetail?: string;
}

export function TriggerBlock({ name, eventLabel, source, dryRunStatus, dryRunDetail }: TriggerBlockProps) {
  return (
    <BlockShell tone="trigger" name={name} tagLabel="Trigger" outputLabel="Output" dryRunStatus={dryRunStatus} dryRunDetail={dryRunDetail}>
      <div className="wf-action__selected">{eventLabel}</div>
      <div className="wf-action__field">
        <div className="wf-action__field-label">Source object</div>
        <div className="wf-action__field-value">{source}</div>
      </div>
    </BlockShell>
  );
}
