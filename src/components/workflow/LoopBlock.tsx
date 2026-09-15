import type { ReactNode } from "react";
import { BlockShell } from "./BlockShell";
import type { NodeStatus } from "../../lib/dryRun";

interface LoopBlockProps {
  name: string;
  elements: string;
  elementVar: string;
  indexVar: string;
  children: ReactNode;
  dryRunStatus?: NodeStatus;
  dryRunDetail?: string;
}

export function LoopBlock({ name, elements, elementVar, indexVar, children, dryRunStatus, dryRunDetail }: LoopBlockProps) {
  return (
    <BlockShell tone="loop" name={name} tagLabel="Ontology edits" dryRunStatus={dryRunStatus} dryRunDetail={dryRunDetail}>
      <div className="wf-loop__section-label">Elements</div>
      <div className="wf-loop__chip">{elements}</div>

      <div className="wf-loop__for-each">
        <span>For each</span>
        <span className="wf-loop__chip wf-loop__chip--sm">{elementVar}</span>
        <span className="wf-loop__chip wf-loop__chip--sm">{indexVar}</span>
      </div>

      <div className="wf-loop__nested">{children}</div>
    </BlockShell>
  );
}
