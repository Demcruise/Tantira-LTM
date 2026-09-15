import { Tag } from "@blueprintjs/core";
import type { Priority, LeadStatus } from "../types";

const PRIORITY_COLOR: Record<Priority, string> = {
  Hot: "#CD4246",
  Warm: "#C87619",
  Cold: "#5F6B7C",
};

const PRIORITY_ICON: Record<Priority, "flame" | undefined> = {
  Hot: "flame",
  Warm: undefined,
  Cold: undefined,
};

export function PriorityTag({ priority }: { priority: Priority }) {
  return (
    <Tag round icon={PRIORITY_ICON[priority]} style={{ background: PRIORITY_COLOR[priority], color: "#fff" }}>
      {priority}
    </Tag>
  );
}

const STATUS_COLOR: Record<LeadStatus, string> = {
  New: "#2D72D2",
  Contacted: "#C87619",
  Qualified: "#238551",
  Assigned: "#238551",
  Lost: "#CD4246",
};

export function StatusTag({ status }: { status: LeadStatus }) {
  return (
    <Tag minimal style={{ color: STATUS_COLOR[status], border: `1px solid ${STATUS_COLOR[status]}` }}>
      {status}
    </Tag>
  );
}
