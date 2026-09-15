import { Icon } from "@blueprintjs/core";
import type { Lead } from "../../types";

type StepState = "done" | "current" | "pending" | "failed";

interface Step {
  label: string;
  state: StepState;
}

function buildSteps(lead: Lead): Step[] {
  const enrichedDone = lead.accountMatch !== "ambiguous";
  const assignedDone = lead.assignedTo !== null;
  const actionedDone = lead.actions.length > 0;
  const qualifiedDone = lead.status === "Qualified" || lead.outcome !== null;
  const closed = lead.outcome !== null;

  function state(done: boolean, blockedByPrior: boolean): StepState {
    if (closed && lead.outcome === "Lost" && !done) return "pending";
    if (done) return "done";
    return blockedByPrior ? "pending" : "current";
  }

  return [
    { label: "Inbound", state: "done" },
    { label: "Enriched", state: enrichedDone ? "done" : "current" },
    { label: "Prioritized", state: "done" },
    { label: "Assigned", state: state(assignedDone, !enrichedDone) },
    { label: "Actioned", state: state(actionedDone, !assignedDone) },
    { label: "Qualified", state: state(qualifiedDone, !actionedDone) },
    {
      label: closed ? lead.outcome! : "Won / Lost",
      state: closed ? (lead.outcome === "Won" ? "done" : lead.outcome === "Lost" ? "failed" : "pending") : "pending",
    },
  ];
}

export function LeadLifecycleStepper({ lead }: { lead: Lead }) {
  const steps = buildSteps(lead);
  return (
    <div className="lifecycle-stepper">
      {steps.map((step, i) => (
        <div key={step.label} className={`lifecycle-stepper__step lifecycle-stepper__step--${step.state}`}>
          <span className="lifecycle-stepper__dot">
            {step.state === "done" && <Icon icon="tick" size={9} />}
            {step.state === "failed" && <Icon icon="cross" size={9} />}
          </span>
          <span className="lifecycle-stepper__label">{step.label}</span>
          {i < steps.length - 1 && <span className="lifecycle-stepper__connector" />}
        </div>
      ))}
    </div>
  );
}
