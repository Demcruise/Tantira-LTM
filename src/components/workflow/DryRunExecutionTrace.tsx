import { Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { DryRunStep, NodeStatus } from "../../lib/dryRun";

const STEP_ICON: Record<NodeStatus, IconName> = {
  pass: "tick-circle",
  fail: "error",
  skip: "ban-circle",
};

export function DryRunExecutionTrace({ steps, leadName }: { steps: DryRunStep[]; leadName: string }) {
  return (
    <div className="wf-dryrun-trace">
      <div className="wf-dryrun-trace__header">Execution trace — {leadName}</div>
      {steps.map((step) => (
        <div key={step.nodeId} className={`wf-dryrun-trace__step wf-dryrun-trace__step--${step.status}`}>
          <Icon icon={STEP_ICON[step.status]} size={14} />
          <div>
            <div className="wf-dryrun-trace__step-label">{step.label}</div>
            <div className="wf-dryrun-trace__step-detail">{step.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
