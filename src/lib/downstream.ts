import type { IconName } from "@blueprintjs/icons";
import type { DownstreamKind, DownstreamSequence } from "../types";

export interface SequenceDef {
  label: string;
  icon: IconName;
  owner: string; // which system runs it
  cadenceHours: number; // one step completes per cadence
  steps: string[];
}

export const SEQUENCES: Record<DownstreamKind, SequenceDef> = {
  onboarding: {
    label: "Onboarding",
    icon: "star",
    owner: "Customer Success automation",
    cadenceHours: 24,
    steps: ["Welcome email sent", "Account handed to CS owner", "Kickoff call scheduled", "Workspace provisioned", "30-day check-in booked"],
  },
  nurture: {
    label: "Nurture sequence",
    icon: "send-to",
    owner: "Marketing automation",
    cadenceHours: 72,
    steps: ["Intro content sent", "Case study sent", "Engagement scored", "Rep follow-up nudge", "Re-qualification review"],
  },
  re_engagement: {
    label: "Re-engagement nurture",
    icon: "refresh",
    owner: "Marketing automation",
    cadenceHours: 24 * 30,
    steps: ["Loss reason recorded", "Quiet period (30d)", "Check-in touch (60d)", "Re-qualification (90d)"],
  },
};

export interface SequenceProgress {
  def: SequenceDef;
  completed: number;
  total: number;
  nextStep: string | null;
  nextDueAt: string | null; // ISO
  stepTimes: string[]; // ISO per completed step
}

export function sequenceProgress(seq: DownstreamSequence, now = Date.now()): SequenceProgress {
  const def = SEQUENCES[seq.kind];
  const start = new Date(seq.startedAt).getTime();
  const cadenceMs = def.cadenceHours * 60 * 60 * 1000;
  const elapsedSteps = Math.floor((now - start) / cadenceMs) + 1; // first step fires at start
  const completed = Math.max(0, Math.min(def.steps.length, elapsedSteps));
  const nextStep = completed < def.steps.length ? def.steps[completed] : null;
  const nextDueAt = nextStep ? new Date(start + completed * cadenceMs).toISOString() : null;
  const stepTimes = Array.from({ length: completed }, (_, i) => new Date(start + i * cadenceMs).toISOString());
  return { def, completed, total: def.steps.length, nextStep, nextDueAt, stepTimes };
}
