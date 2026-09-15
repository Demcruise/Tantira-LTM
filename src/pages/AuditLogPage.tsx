import { Fragment, useMemo, useState } from "react";
import { Button, Card, HTMLSelect, HTMLTable, Icon, InputGroup, Tag } from "@blueprintjs/core";
import type { AuditLogEntry } from "../types";
import { AppToaster } from "../lib/toaster";
import { PageHeader } from "../components/PageHeader";

type DateRange = "24h" | "7d" | "30d" | "90d" | "all";

const RANGE_HOURS: Record<DateRange, number | null> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
  "90d": 24 * 90,
  all: null,
};

function actorLabel(entry: AuditLogEntry): string {
  return entry.actor.type === "system" ? "System" : entry.actor.name;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditLogPage({ entries, initialSearch }: { entries: AuditLogEntry[]; initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch ?? "");
  const [range, setRange] = useState<DateRange>("7d");
  const [eventType, setEventType] = useState("All");
  const [actorFilter, setActorFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const eventTypes = useMemo(() => ["All", ...Array.from(new Set(entries.map((e) => e.action)))], [entries]);
  const actors = useMemo(() => ["All", ...Array.from(new Set(entries.map(actorLabel)))], [entries]);

  const filtered = useMemo(() => {
    const hours = RANGE_HOURS[range];
    const cutoff = hours === null ? null : Date.now() - hours * 60 * 60 * 1000;
    const q = search.trim().toLowerCase();

    return entries
      .filter((e) => (cutoff === null ? true : new Date(e.timestamp).getTime() >= cutoff))
      .filter((e) => (eventType === "All" ? true : e.action === eventType))
      .filter((e) => (actorFilter === "All" ? true : actorLabel(e) === actorFilter))
      .filter((e) => {
        if (!q) return true;
        return actorLabel(e).toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.object.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [entries, range, eventType, actorFilter, search]);

  function handleExport() {
    AppToaster.show({
      icon: "cloud-upload",
      intent: "primary",
      message: "Preparing export… we'll notify you when it's ready.",
    });
  }

  return (
    <div className="audit-log-page">
      <PageHeader
        section="Govern"
        title="Audit Log"
        description="Every human-initiated change in this workspace, with before/after values."
        actions={<Button icon="export" text="Export CSV" onClick={handleExport} />}
      />

      <Card className="page-card">
      <div className="audit-log-page__filters">
        <InputGroup
          leftIcon="search"
          placeholder="Search actor/action…"
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
        <HTMLSelect value={eventType} onChange={(e) => setEventType(e.target.value)}>
          {eventTypes.map((t) => (
            <option key={t} value={t}>
              {t === "All" ? "All event types" : t}
            </option>
          ))}
        </HTMLSelect>
        <HTMLSelect value={actorFilter} onChange={(e) => setActorFilter(e.target.value)}>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a === "All" ? "All users" : a}
            </option>
          ))}
        </HTMLSelect>
      </div>

      <HTMLTable className="audit-log-page__table" interactive>
        <thead>
          <tr>
            <th>Time</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Object</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((entry) => {
            const expanded = expandedId === entry.id;
            return (
              <Fragment key={entry.id}>
                <tr onClick={() => setExpandedId(expanded ? null : entry.id)}>
                  <td className="audit-log-page__time">{formatTimestamp(entry.timestamp)}</td>
                  <td>
                    <span className="audit-log-page__actor">
                      <Icon
                        icon={entry.actor.type === "system" ? "cog" : "person"}
                        size={13}
                        className={entry.actor.type === "system" ? "audit-log-page__actor-icon--system" : "audit-log-page__actor-icon--user"}
                      />
                      {actorLabel(entry)}
                    </span>
                  </td>
                  <td>{entry.action}</td>
                  <td>{entry.object}</td>
                  <td className="audit-log-page__expand">
                    <Icon icon={expanded ? "chevron-up" : "chevron-down"} size={14} />
                  </td>
                </tr>
                {expanded && (
                  <tr className="audit-log-page__detail-row">
                    <td colSpan={5}>
                      <div className="audit-log-page__detail">
                        <div className="audit-log-page__detail-item">
                          <span>IP address</span>
                          <strong>{entry.ip}</strong>
                        </div>
                        <div className="audit-log-page__detail-item">
                          <span>User agent</span>
                          <strong>{entry.userAgent}</strong>
                        </div>
                        {entry.before !== undefined && (
                          <div className="audit-log-page__detail-item">
                            <span>Before</span>
                            <Tag minimal intent="danger">
                              {entry.before}
                            </Tag>
                          </div>
                        )}
                        {entry.after !== undefined && (
                          <div className="audit-log-page__detail-item">
                            <span>After</span>
                            <Tag minimal intent="success">
                              {entry.after}
                            </Tag>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </HTMLTable>

      {filtered.length === 0 && <p className="audit-log-page__empty">No events in this range.</p>}
      </Card>
    </div>
  );
}
