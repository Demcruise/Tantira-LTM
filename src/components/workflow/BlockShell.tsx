import type { ReactNode } from "react";
import { Icon, Tag, Tooltip } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { NodeStatus } from "../../lib/dryRun";

export type BlockTone = "trigger" | "action" | "conditional" | "loop";

const STATUS_ICON: Record<NodeStatus, IconName> = {
  pass: "tick-circle",
  fail: "error",
  skip: "ban-circle",
};

const STATUS_INTENT: Record<NodeStatus, "success" | "danger" | "none"> = {
  pass: "success",
  fail: "danger",
  skip: "none",
};

const STATUS_LABEL: Record<NodeStatus, string> = {
  pass: "Pass",
  fail: "Fail",
  skip: "Skipped",
};

const TONE_ICON: Record<BlockTone, IconName> = {
  trigger: "flash",
  action: "cog",
  conditional: "flow-branch",
  loop: "repeat",
};

const TONE_LABEL: Record<BlockTone, string> = {
  trigger: "Trigger",
  action: "Action",
  conditional: "Conditional",
  loop: "Loop",
};

interface BlockShellProps {
  tone: BlockTone;
  name: string;
  tagIcon?: IconName;
  tagLabel: string;
  description?: string;
  outputLabel?: string;
  children: ReactNode;
  nested?: boolean;
  dryRunStatus?: NodeStatus;
  dryRunDetail?: string;
  icon?: IconName;
  typeLabel?: string;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function BlockShell({
  tone,
  name,
  tagIcon,
  tagLabel,
  description,
  outputLabel,
  children,
  nested,
  dryRunStatus,
  dryRunDetail,
  icon,
  typeLabel,
  onRemove,
  onMoveUp,
  onMoveDown,
}: BlockShellProps) {
  return (
    <div className={`wf-block wf-block--${tone}${nested ? " wf-block--nested" : ""}${dryRunStatus ? ` wf-block--dryrun-${dryRunStatus}` : ""}`}>
      {description !== undefined && <div className="wf-block__description">{description || "Add description…"}</div>}
      <div className="wf-block__card">
        <div className="wf-block__header">
          <span className="wf-block__grip">::::</span>
          <span className={`wf-block__icon wf-block__icon--${tone}`}>
            <Icon icon={icon ?? TONE_ICON[tone]} size={14} />
          </span>
          <span className="wf-block__type">{typeLabel ?? TONE_LABEL[tone]}:</span>
          <span className="wf-block__name">{name}</span>
          <Tag minimal className="wf-block__tag" icon={tagIcon}>
            {tagLabel}
          </Tag>
          {outputLabel && (
            <Tooltip content={`This step's result is available to later steps as "${name}.Output".`} placement="top">
              <Tag minimal intent="primary" className="wf-block__output">
                {outputLabel}
              </Tag>
            </Tooltip>
          )}
          {dryRunStatus && (
            <Tag minimal intent={STATUS_INTENT[dryRunStatus]} icon={STATUS_ICON[dryRunStatus]} className="wf-block__dryrun-tag">
              {STATUS_LABEL[dryRunStatus]}
            </Tag>
          )}
          {(onMoveUp || onMoveDown || onRemove) && (
            <span className="wf-block__toolbar">
              {onMoveUp && (
                <button type="button" className="wf-block__control" title="Move step up" aria-label="Move step up" onClick={onMoveUp}>
                  <Icon icon="arrow-up" size={12} />
                </button>
              )}
              {onMoveDown && (
                <button type="button" className="wf-block__control" title="Move step down" aria-label="Move step down" onClick={onMoveDown}>
                  <Icon icon="arrow-down" size={12} />
                </button>
              )}
              {onRemove && (
                <button type="button" className="wf-block__control wf-block__remove" title="Remove step" aria-label="Remove step" onClick={onRemove}>
                  <Icon icon="cross" size={13} />
                </button>
              )}
            </span>
          )}
        </div>
        <div className="wf-block__body">{children}</div>
        {dryRunStatus && dryRunDetail && (
          <div className={`wf-block__dryrun-detail wf-block__dryrun-detail--${dryRunStatus}`}>
            <Icon icon={STATUS_ICON[dryRunStatus]} size={12} />
            <span>{dryRunDetail}</span>
          </div>
        )}
      </div>
    </div>
  );
}
