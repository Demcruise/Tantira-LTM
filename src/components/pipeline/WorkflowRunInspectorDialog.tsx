import { Classes, Dialog, Icon } from "@blueprintjs/core";
import type { AutoProcessedEntry, AutoProcessedEventType } from "../../types";
import { EVENT_ICON, EVENT_LABEL } from "../../lib/autoProcessedLog";

function eventIntentColor(type: AutoProcessedEventType): string {
  if (type === "sync_failed") return "#CD4246";
  if (type === "synced" || type === "nurture" || type === "downstream") return "#238551";
  return "#5F6B7C";
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

interface WorkflowRunInspectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leadName: string | null;
  steps: AutoProcessedEntry[];
}

export function WorkflowRunInspectorDialog({ isOpen, onClose, leadName, steps }: WorkflowRunInspectorDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={leadName ? `Run: ${leadName}` : "Run"} icon="pulse" className="run-inspector-dialog">
      <div className={Classes.DIALOG_BODY}>
        {steps.length === 0 ? (
          <p className="run-inspector-dialog__empty">No automated steps recorded for this lead yet.</p>
        ) : (
          <div className="run-inspector-dialog__trace">
            {steps.map((step, i) => {
              const color = eventIntentColor(step.eventType);
              const failed = step.eventType === "sync_failed";
              return (
                <div key={step.id} className="run-inspector-dialog__step">
                  <div className="run-inspector-dialog__step-rail">
                    <div className="run-inspector-dialog__step-dot" style={{ borderColor: color, color }}>
                      <Icon icon={failed ? "cross" : EVENT_ICON[step.eventType]} size={12} />
                    </div>
                    {i < steps.length - 1 && <div className="run-inspector-dialog__step-line" />}
                  </div>
                  <div className="run-inspector-dialog__step-body">
                    <div className="run-inspector-dialog__step-header">
                      <span className="run-inspector-dialog__step-label" style={{ color }}>
                        {EVENT_LABEL[step.eventType]}
                      </span>
                      <span className="run-inspector-dialog__step-time">{formatTimestamp(step.time)}</span>
                    </div>
                    {step.detail && <p className="run-inspector-dialog__step-detail">{step.detail}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Dialog>
  );
}
