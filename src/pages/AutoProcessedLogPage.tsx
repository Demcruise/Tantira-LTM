import { useMemo, useState } from "react";
import { Card, HTMLSelect, HTMLTable, Icon, InputGroup, Tooltip } from "@blueprintjs/core";
import { PageHeader } from "../components/PageHeader";
import type { AutoProcessedEntry, AutoProcessedEventType } from "../types";
import { EVENT_ICON, EVENT_LABEL } from "../lib/autoProcessedLog";
import { LeadsAreaTabs } from "../components/needs-attention/LeadsAreaTabs";
import type { AppView } from "../components/app-sidebar-4";

type DateRange = "24h" | "7d" | "30d" | "90d" | "all";

const RANGE_HOURS: Record<DateRange, number | null> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
  "90d": 24 * 90,
  all: null,
};

const EVENT_TYPES: AutoProcessedEventType[] = ["captured", "enriched", "scored", "synced", "sync_failed", "nurture", "downstream"];

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function eventIntentColor(type: AutoProcessedEventType): string {
  if (type === "sync_failed") return "#CD4246";
  if (type === "synced" || type === "nurture" || type === "downstream") return "#238551";
  return "#5F6B7C";
}

interface AutoProcessedLogPageProps {
  entries: AutoProcessedEntry[];
  onSelectLead: (leadId: string) => void;
  onChangeView: (view: AppView) => void;
  initialSearch?: string;
}

export function AutoProcessedLogPage({ entries, onSelectLead, onChangeView, initialSearch }: AutoProcessedLogPageProps) {
  const [search, setSearch] = useState(initialSearch ?? "");
  const [range, setRange] = useState<DateRange>("7d");
  const [eventType, setEventType] = useState<"All" | AutoProcessedEventType>("All");

  const filtered = useMemo(() => {
    const hours = RANGE_HOURS[range];
    const cutoff = hours === null ? null : Date.now() - hours * 60 * 60 * 1000;
    const q = search.trim().toLowerCase();

    return entries
      .filter((e) => (cutoff === null ? true : new Date(e.time).getTime() >= cutoff))
      .filter((e) => (eventType === "All" ? true : e.eventType === eventType))
      .filter((e) => {
        if (!q) return true;
        return e.leadName.toLowerCase().includes(q) || e.label.toLowerCase().includes(q);
      });
  }, [entries, range, eventType, search]);

  return (
    <div className="auto-processed-log-page">
      <PageHeader
        title="Auto-Processed Log"
        description="What the automation did on its own — no human action here."
        tabs={<LeadsAreaTabs current="auto-processed-log" onChange={onChangeView} />}
      />

      <Card className="page-card">
      <div className="audit-log-page__filters">
        <InputGroup
          leftIcon="search"
          placeholder="Search lead or event…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="audit-log-page__search"
        />
        <HTMLSelect value={range} onChange={(e) => setRange(e.target.value as DateRange)}>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </HTMLSelect>
        <HTMLSelect value={eventType} onChange={(e) => setEventType(e.target.value as "All" | AutoProcessedEventType)}>
          <option value="All">All event types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {EVENT_LABEL[t]}
            </option>
          ))}
        </HTMLSelect>
      </div>

      <HTMLTable className="audit-log-page__table" interactive striped>
        <thead>
          <tr>
            <th>Time</th>
            <th>Lead</th>
            <th>Event</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id} onClick={() => onSelectLead(e.leadId)}>
              <td className="audit-log-page__time">{formatTimestamp(e.time)}</td>
              <td>
                <Tooltip content="Open this lead">
                  <span className="auto-processed-log-page__lead-link">{e.leadName}</span>
                </Tooltip>
              </td>
              <td>
                <span className="auto-processed-log-page__event" style={{ color: eventIntentColor(e.eventType) }}>
                  <Icon icon={EVENT_ICON[e.eventType]} size={13} />
                  {e.label}
                </span>
              </td>
              <td className="auto-processed-log-page__detail">{e.detail ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>

      {filtered.length === 0 && <p className="audit-log-page__empty">No automated events in this range.</p>}
      </Card>
    </div>
  );
}
