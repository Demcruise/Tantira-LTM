import { Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import { BlockShell } from "./BlockShell";
import type { NodeStatus } from "../../lib/dryRun";

interface ActionField {
  label: string;
  value: string;
  required?: boolean;
}

interface ActionBlockProps {
  name: string;
  actionIcon?: IconName;
  actionLabel: string;
  fields: ActionField[];
  outputLabel?: string;
  nested?: boolean;
  dryRunStatus?: NodeStatus;
  dryRunDetail?: string;
  configLink?: { label: string; onClick: () => void };
}

export function ActionBlock({
  name,
  actionIcon = "flash",
  actionLabel,
  fields,
  outputLabel,
  nested,
  dryRunStatus,
  dryRunDetail,
  configLink,
}: ActionBlockProps) {
  return (
    <BlockShell
      tone="action"
      name={name}
      tagIcon={actionIcon}
      tagLabel="Writes data"
      outputLabel={outputLabel}
      nested={nested}
      dryRunStatus={dryRunStatus}
      dryRunDetail={dryRunDetail}
    >
      <div className="wf-action__selected">{actionLabel}</div>
      {fields.map((f) => (
        <div className="wf-action__field" key={f.label}>
          <div className="wf-action__field-label">
            {f.label}
            {f.required && <span className="wf-required">*</span>}
          </div>
          <div className="wf-action__field-value">{f.value}</div>
        </div>
      ))}
      {configLink && (
        <button type="button" className="wf-block__config-link" onClick={configLink.onClick}>
          <Icon icon="cog" size={12} />
          <span>{configLink.label}</span>
          <Icon icon="arrow-right" size={11} />
        </button>
      )}
    </BlockShell>
  );
}
