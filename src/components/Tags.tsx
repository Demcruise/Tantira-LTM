import { Tag } from "@blueprintjs/core";
import type { Priority, LeadStatus } from "../types";
import type { Segment } from "../lib/enrichment";

const PRIORITY_COLOR: Record<Priority, { bg: string; text: string }> = {
  Hot: { bg: "#FDEBEC", text: "#B3262C" },
  Warm: { bg: "#FDF1E3", text: "#A85D12" },
  Cold: { bg: "#EDEFF2", text: "#5F6B7C" },
};

const PRIORITY_ICON: Record<Priority, "flame" | undefined> = {
  Hot: "flame",
  Warm: undefined,
  Cold: undefined,
};

export function PriorityTag({ priority }: { priority: Priority }) {
  const { bg, text } = PRIORITY_COLOR[priority];
  return (
    <Tag round icon={PRIORITY_ICON[priority]} style={{ background: bg, color: text }}>
      {priority}
    </Tag>
  );
}

const STATUS_COLOR: Record<LeadStatus, { bg: string; text: string }> = {
  New: { bg: "#EBF1FE", text: "#215DB0" },
  Contacted: { bg: "#FDF1E3", text: "#A85D12" },
  Qualified: { bg: "#E7F7EF", text: "#1C6E42" },
  Assigned: { bg: "#E7F7EF", text: "#1C6E42" },
  Lost: { bg: "#FDEBEC", text: "#B3262C" },
};

export function StatusTag({ status }: { status: LeadStatus }) {
  const { bg, text } = STATUS_COLOR[status];
  return (
    <Tag round style={{ background: bg, color: text }}>
      {status}
    </Tag>
  );
}

const SEGMENT_COLOR: Record<Segment, { bg: string; text: string }> = {
  Enterprise: { bg: "#F1EBFB", text: "#634DBF" },
  "Mid-market": { bg: "#EBF1FE", text: "#215DB0" },
  SMB: { bg: "#EDEFF2", text: "#5F6B7C" },
};

export function SegmentTag({ segment }: { segment: Segment }) {
  const { bg, text } = SEGMENT_COLOR[segment];
  return (
    <Tag round style={{ background: bg, color: text }}>
      {segment}
    </Tag>
  );
}
