import { Button, Icon, Tag, Tooltip } from "@blueprintjs/core";
import type { ValidationIssue, WorkflowVersion } from "../../lib/workflowLifecycle";
import { relativeTime } from "../../lib/relativeTime";

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

type LifecycleStep = "Draft" | "Test" | "Validate" | "Publish" | "Monitor";

// Each step's "done" condition reads as a single clear statement.
function isStepDone(step: LifecycleStep, s: { dirty: boolean; testedSinceChange: boolean; validated: boolean }): boolean {
  switch (step) {
    case "Draft":
      return s.dirty; // draft exists once there are unpublished changes
    case "Test":
      return s.testedSinceChange || !s.dirty;
    case "Validate":
      return s.validated || !s.dirty;
    case "Publish":
      return !s.dirty; // published once changes are committed
    case "Monitor":
      return !s.dirty; // monitoring the published version
  }
}

// Each step's "current" condition reads as a single clear statement.
function isStepCurrent(step: LifecycleStep, s: { dirty: boolean; testedSinceChange: boolean; validated: boolean; stage: string }): boolean {
  switch (step) {
    case "Draft":
      return s.dirty && !s.testedSinceChange;
    case "Test":
      return s.dirty && !s.testedSinceChange;
    case "Validate":
      return s.dirty && s.testedSinceChange && !s.validated;
    case "Publish":
      return s.stage === "ready";
    case "Monitor":
      return !s.dirty;
  }
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
        {(["Draft", "Test", "Validate", "Publish", "Monitor"] as const).map((label) => {
          const done = isStepDone(label, { dirty, testedSinceChange, validated });
          const current = isStepCurrent(label, { dirty, testedSinceChange, validated, stage });
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
