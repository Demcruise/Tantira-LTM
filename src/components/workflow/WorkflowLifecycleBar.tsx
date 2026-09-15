import { Button, Icon, Tag, Tooltip } from "@blueprintjs/core";
import type { ValidationIssue, WorkflowVersion } from "../../lib/workflowLifecycle";

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

interface WorkflowLifecycleBarProps {
  published: WorkflowVersion;
  previousVersion: WorkflowVersion | null;
  dirty: boolean;
  testedSinceChange: boolean;
  issues: ValidationIssue[] | null; // null = not validated yet
  runsThisWeek: number;
  errorsThisWeek: number;
  lastRunAt: string | null;
  onValidate: () => void;
  onPublish: () => void;
  onRollback: () => void;
  onDiscard: () => void;
}

export function WorkflowLifecycleBar({
  published,
  previousVersion,
  dirty,
  testedSinceChange,
  issues,
  runsThisWeek,
  errorsThisWeek,
  lastRunAt,
  onValidate,
  onPublish,
  onRollback,
  onDiscard,
}: WorkflowLifecycleBarProps) {
  const validated = issues !== null && issues.length === 0;
  const stage = !dirty ? "published" : validated && testedSinceChange ? "ready" : "draft";
  const publishBlockers: string[] = [];
  if (!dirty) publishBlockers.push("No changes since v" + published.version + ".");
  if (dirty && !testedSinceChange) publishBlockers.push("Run a test against a real lead first.");
  if (dirty && issues === null) publishBlockers.push("Validate the draft first.");
  if (dirty && issues && issues.length > 0) publishBlockers.push(`${issues.length} validation issue${issues.length === 1 ? "" : "s"} to fix.`);

  return (
    <div className="wf-lifecycle">
      <div className="wf-lifecycle__status">
        <Tag large minimal intent={stage === "published" ? "success" : stage === "ready" ? "primary" : "warning"} icon={stage === "published" ? "tick-circle" : stage === "ready" ? "endorsed" : "edit"}>
          {stage === "published" ? `Published v${published.version}` : stage === "ready" ? `Draft ready to publish (v${published.version + 1})` : `Draft — unpublished changes over v${published.version}`}
        </Tag>
        <span className="wf-lifecycle__meta">
          <Icon icon="history" size={11} /> v{published.version} live since {relativeTime(published.publishedAt)} by {published.publishedBy}
        </span>
        <span className="wf-lifecycle__meta">
          <Icon icon="pulse" size={11} /> {runsThisWeek} runs this week · <span className={errorsThisWeek > 0 ? "wf-lifecycle__errors" : ""}>{errorsThisWeek} errors</span>
          {lastRunAt && ` · last run ${relativeTime(lastRunAt)}`}
        </span>
      </div>

      <div className="wf-lifecycle__steps">
        {["Draft", "Test", "Validate", "Publish", "Monitor"].map((label, i) => {
          const done = [dirty || !dirty, testedSinceChange || !dirty, validated || !dirty, !dirty, !dirty][i];
          const current = (label === "Draft" && dirty && !testedSinceChange) || (label === "Test" && dirty && !testedSinceChange) || (label === "Validate" && dirty && testedSinceChange && !validated) || (label === "Publish" && stage === "ready") || (label === "Monitor" && !dirty);
          return (
            <span key={label} className={`wf-lifecycle__step${done ? " wf-lifecycle__step--done" : ""}${current ? " wf-lifecycle__step--current" : ""}`}>
              {label}
            </span>
          );
        })}
      </div>

      <div className="wf-lifecycle__actions">
        <Button small icon="clean" text="Validate" disabled={!dirty} onClick={onValidate} />
        <Tooltip content={publishBlockers.length ? publishBlockers.join(" ") : `Publish as v${published.version + 1}. Applies to every lead captured from now on.`} placement="bottom">
          <Button small intent="primary" icon="cloud-upload" text="Publish" disabled={publishBlockers.length > 0} onClick={onPublish} />
        </Tooltip>
        {dirty && <Button small minimal icon="undo" text="Discard draft" onClick={onDiscard} />}
        <Tooltip content={previousVersion ? `Restore v${previousVersion.version} (published ${relativeTime(previousVersion.publishedAt)}).` : "No earlier version to roll back to."} placement="bottom">
          <Button small minimal icon="reset" text="Rollback" disabled={!previousVersion} onClick={onRollback} />
        </Tooltip>
      </div>

      {issues && issues.length > 0 && (
        <ul className="wf-lifecycle__issues">
          {issues.map((i, idx) => (
            <li key={idx}>
              <Icon icon="error" size={11} /> <strong>{i.label}:</strong> {i.message}
            </li>
          ))}
        </ul>
      )}
      {issues && issues.length === 0 && dirty && (
        <p className="wf-lifecycle__ok">
          <Icon icon="tick" size={11} /> Draft is valid.
        </p>
      )}
    </div>
  );
}
