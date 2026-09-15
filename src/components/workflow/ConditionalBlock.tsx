import type { ReactNode } from "react";
import { BlockShell } from "./BlockShell";
import type { NodeStatus } from "../../lib/dryRun";

interface ConditionalBlockProps {
  name: string;
  condition: { left: string; operator: string; right: string };
  thenLabel: string;
  elseLabel: string;
  thenChildren: ReactNode;
  elseChildren: ReactNode;
  dryRunStatus?: NodeStatus;
  dryRunDetail?: string;
  branchTaken?: "then" | "else";
}

export function ConditionalBlock({
  name,
  condition,
  thenLabel,
  elseLabel,
  thenChildren,
  elseChildren,
  dryRunStatus,
  dryRunDetail,
  branchTaken,
}: ConditionalBlockProps) {
  return (
    <BlockShell tone="conditional" name={name} tagLabel="String" dryRunStatus={dryRunStatus} dryRunDetail={dryRunDetail}>
      <div className="wf-cond__section-label">When</div>
      <div className="wf-cond__row">
        <span className="wf-cond__chip">{condition.left}</span>
        <span className="wf-cond__operator">{condition.operator}</span>
        <span className="wf-cond__chip">{condition.right}</span>
      </div>

      <div className={`wf-cond__branch${branchTaken === "else" ? " wf-cond__branch--skipped" : branchTaken === "then" ? " wf-cond__branch--taken" : ""}`}>
        <div className="wf-cond__section-label">Then — {thenLabel}</div>
        <div className="wf-cond__nested">{thenChildren}</div>
      </div>

      <div className={`wf-cond__branch${branchTaken === "then" ? " wf-cond__branch--skipped" : branchTaken === "else" ? " wf-cond__branch--taken" : ""}`}>
        <div className="wf-cond__section-label">Else — {elseLabel}</div>
        <div className="wf-cond__nested">{elseChildren}</div>
      </div>
    </BlockShell>
  );
}
