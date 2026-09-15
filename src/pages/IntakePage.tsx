import { useState } from "react";
import { Button, Card, HTMLTable, Icon, InputGroup, NonIdealState, Radio, RadioGroup, Tag } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { IntakeItem, IntakeItemKind, IntakeSource, IntakeSourceStatus } from "../types";
import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiRow";

export type IntakeResolution =
  | { action: "create"; company: string; matchedExisting: boolean }
  | { action: "merge"; targetLeadId: string }
  | { action: "keep_separate" }
  | { action: "discard" };

const KIND_ICON: Record<IntakeSource["kind"], IconName> = { email: "envelope", form: "form", ads: "target", partner: "people", api: "code", event: "timeline-events" };
const STATUS_META: Record<IntakeSourceStatus, { label: string; intent: "success" | "warning" | "none"; icon: IconName }> = {
  healthy: { label: "Healthy", intent: "success", icon: "tick-circle" },
  delayed: { label: "Delayed", intent: "warning", icon: "time" },
  paused: { label: "Paused", intent: "none", icon: "pause" },
};
const ITEM_KIND_META: Record<IntakeItemKind, { label: string; icon: IconName; hint: string }> = {
  ambiguous_person: { label: "Ambiguous person", icon: "help", hint: "Extractor found more than one matching contact." },
  missing_company: { label: "Missing company", icon: "office", hint: "No company could be resolved from the message or domain." },
  duplicate: { label: "Possible duplicate", icon: "duplicate", hint: "Looks like an existing open lead." },
};

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

interface IntakePageProps {
  sources: IntakeSource[];
  items: IntakeItem[];
  onResolve: (itemId: string, resolution: IntakeResolution) => void;
  onOpenLead: (leadId: string) => void;
}

function UnresolvedRow({ item, source, onResolve, onOpenLead }: { item: IntakeItem; source?: IntakeSource; onResolve: (r: IntakeResolution) => void; onOpenLead: (leadId: string) => void }) {
  const meta = ITEM_KIND_META[item.kind];
  const [candidate, setCandidate] = useState(item.candidates[0] ?? "");
  const [company, setCompany] = useState("");
  const duplicateTarget = item.kind === "duplicate" ? (item.candidates[0]?.split(" ·")[0] ?? "") : "";

  return (
    <div className="intake-row">
      <div className="intake-row__head">
        <Tag minimal icon={meta.icon}>
          {meta.label}
        </Tag>
        <span className="intake-row__who">
          <strong>{item.name}</strong> · {item.email}
          {item.company && ` · ${item.company}`}
        </span>
        <span className="intake-row__meta">
          {source && (
            <>
              <Icon icon={KIND_ICON[source.kind]} size={11} /> {source.name} ·{" "}
            </>
          )}
          {relativeTime(item.receivedAt)}
        </span>
      </div>
      <blockquote className="intake-row__snippet">{item.snippet}</blockquote>
      <p className="intake-row__hint">{meta.hint}</p>

      {item.kind === "ambiguous_person" && (
        <div className="intake-row__resolve">
          <RadioGroup selectedValue={candidate} onChange={(e) => setCandidate(e.currentTarget.value)}>
            {item.candidates.map((c) => (
              <Radio key={c} label={c} value={c} />
            ))}
          </RadioGroup>
          <div className="intake-row__actions">
            <Button
              small
              intent="primary"
              icon="new-person"
              text="Create lead"
              onClick={() => onResolve({ action: "create", company: item.company ?? "", matchedExisting: candidate !== "New person" })}
            />
            <Button small minimal text="Discard" onClick={() => onResolve({ action: "discard" })} />
          </div>
        </div>
      )}

      {item.kind === "missing_company" && (
        <div className="intake-row__resolve">
          <InputGroup placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} className="intake-row__company" />
          <div className="intake-row__actions">
            <Button small intent="primary" icon="new-person" text="Create lead" disabled={!company.trim()} onClick={() => onResolve({ action: "create", company: company.trim(), matchedExisting: false })} />
            <Button small minimal text="Discard" onClick={() => onResolve({ action: "discard" })} />
          </div>
        </div>
      )}

      {item.kind === "duplicate" && (
        <div className="intake-row__resolve">
          <div className="intake-row__duplicate">
            <Icon icon="duplicate" size={12} />
            <span>{item.candidates[0]}</span>
            <Button small minimal text="View" onClick={() => onOpenLead(duplicateTarget)} />
          </div>
          <div className="intake-row__actions">
            <Button small intent="primary" icon="git-merge" text="Merge into existing" onClick={() => onResolve({ action: "merge", targetLeadId: duplicateTarget })} />
            <Button small text="Keep separate" onClick={() => onResolve({ action: "keep_separate" })} />
          </div>
        </div>
      )}
    </div>
  );
}

export function IntakePage({ sources, items, onResolve, onOpenLead }: IntakePageProps) {
  const received = sources.reduce((s, x) => s + x.received, 0);
  const extracted = sources.reduce((s, x) => s + x.extracted, 0);
  const rate = received === 0 ? 100 : Math.round((extracted / received) * 1000) / 10;
  const unresolvedBySource = new Map<string, number>();
  for (const item of items) unresolvedBySource.set(item.sourceId, (unresolvedBySource.get(item.sourceId) ?? 0) + 1);

  return (
    <div className="intake-page">
      <PageHeader
        title="Inbound Sources"
        description="Where leads come from and how well the extractor turns raw messages into leads. Anything it cannot resolve on its own — an ambiguous person, a missing company, a likely duplicate — waits below for a decision, then enters the pipeline like any other lead."
      />

      <div className="kpi-row">
        <KpiCard label="Received (7d)" value={received} icon="inbox" intent="primary" />
        <KpiCard label="Extracted to leads" value={extracted} icon="new-person" intent="success" />
        <KpiCard label="Extraction rate" value={`${rate}%`} icon="percentage" intent={rate >= 95 ? "success" : "warning"} />
        <KpiCard label="Unresolved" value={items.length} icon="help" intent={items.length > 0 ? "warning" : undefined} />
      </div>

      <Card className="page-card">
        <div className="intake-page__section-title">Sources</div>
        <HTMLTable className="intake-sources" interactive>
          <thead>
            <tr>
              <th>Source</th>
              <th>Status</th>
              <th>Received</th>
              <th>Extracted</th>
              <th>Merged at capture</th>
              <th>Unresolved</th>
              <th>Extraction rate</th>
              <th>Last event</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => {
              const st = STATUS_META[s.status];
              const srcRate = s.received === 0 ? 0 : Math.round((s.extracted / s.received) * 100);
              return (
                <tr key={s.id}>
                  <td>
                    <span className="intake-sources__name">
                      <Icon icon={KIND_ICON[s.kind]} size={13} /> {s.name}
                    </span>
                  </td>
                  <td>
                    <Tag minimal intent={st.intent} icon={st.icon}>
                      {st.label}
                    </Tag>
                  </td>
                  <td>{s.received}</td>
                  <td>{s.extracted}</td>
                  <td className="intake-sources__muted">{s.collapsedDuplicates}</td>
                  <td>{unresolvedBySource.get(s.id) ?? 0}</td>
                  <td>
                    <div className="intake-sources__rate">
                      <div className="intake-sources__rate-track">
                        <div className="intake-sources__rate-fill" style={{ width: `${srcRate}%`, background: srcRate >= 95 ? "#238551" : "#c87619" }} />
                      </div>
                      <span>{s.received === 0 ? "—" : `${srcRate}%`}</span>
                    </div>
                  </td>
                  <td className="intake-sources__muted">{relativeTime(s.lastEventAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </HTMLTable>
      </Card>

      <Card className="page-card">
        <div className="intake-page__section-title">
          Unresolved queue <span className="my-leads-page__count">{items.length}</span>
        </div>
        {items.length === 0 ? (
          <NonIdealState icon="tick-circle" title="Everything resolved" description="Every inbound message has become a lead or been dismissed." />
        ) : (
          items.map((item) => (
            <UnresolvedRow key={item.id} item={item} source={sources.find((s) => s.id === item.sourceId)} onResolve={(r) => onResolve(item.id, r)} onOpenLead={onOpenLead} />
          ))
        )}
      </Card>
    </div>
  );
}
