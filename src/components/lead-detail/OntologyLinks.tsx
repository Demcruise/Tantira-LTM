import { useState } from "react";
import { Icon, Tag } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { Lead } from "../../types";
import { deriveEnrichmentData } from "../../lib/enrichment";
import { OntologyGraph } from "./OntologyGraph";

type StatusIntent = "success" | "warning" | "none";

interface EntityRow {
  type: string;
  icon: IconName;
  name: string;
  meta: string;
  statusLabel: string;
  statusIntent: StatusIntent;
  detail: string;
}

function buildRows(lead: Lead): EntityRow[] {
  const data = deriveEnrichmentData(lead);

  return [
    {
      type: "Contact",
      icon: "person",
      name: lead.name,
      meta: lead.email,
      statusLabel: "New",
      statusIntent: "none",
      detail: `Created from ${lead.source} on ${new Date(lead.createdAt).toLocaleDateString()}.`,
    },
    {
      type: "Account",
      icon: "office",
      name: lead.company,
      meta: `${data.industry} · ${data.employeeBand} employees`,
      statusLabel:
        lead.accountMatch === "matched" ? "Existing" : lead.accountMatch === "ambiguous" ? `${lead.candidateAccounts.length} candidates` : "New",
      statusIntent: lead.accountMatch === "matched" ? "success" : lead.accountMatch === "ambiguous" ? "warning" : "none",
      detail:
        lead.accountMatch === "matched"
          ? `Linked via ${lead.email} — ${data.segment} segment, ${data.hqLocation}.`
          : lead.accountMatch === "ambiguous"
            ? `Possible matches: ${lead.candidateAccounts.join(", ")} — resolve above to link.`
            : `No existing match — a new company profile is created on sync.`,
    },
    {
      type: "Opportunity",
      icon: "briefcase",
      name: lead.outcome === "Won" ? `${lead.company} — Won` : "Not created",
      meta: lead.outcome === "Won" ? (lead.outcomeReason ?? "Closed won") : "Created automatically once this lead is won",
      statusLabel: lead.outcome === "Won" ? "Created" : "None yet",
      statusIntent: lead.outcome === "Won" ? "success" : "none",
      detail:
        lead.outcome === "Won"
          ? `Closed won${lead.outcomeReason ? ` — ${lead.outcomeReason}` : ""}. Onboarding sequence available below.`
          : `No opportunity yet. One is created automatically when this lead's outcome is logged as Won.`,
    },
  ];
}

export function OntologyLinks({ lead }: { lead: Lead }) {
  const [openType, setOpenType] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "graph">("list");
  const rows = buildRows(lead);

  return (
    <div className="ontology-links">
      <div className="ontology-links__view-toggle">
        <button type="button" className={view === "list" ? "ontology-links__view-btn ontology-links__view-btn--active" : "ontology-links__view-btn"} onClick={() => setView("list")}>
          List
        </button>
        <button type="button" className={view === "graph" ? "ontology-links__view-btn ontology-links__view-btn--active" : "ontology-links__view-btn"} onClick={() => setView("graph")}>
          Graph
        </button>
      </div>

      {view === "graph" ? (
        <OntologyGraph lead={lead} />
      ) : (
        rows.map((row) => {
        const open = openType === row.type;
        return (
          <div key={row.type} className="ontology-links__item">
            <button type="button" className="ontology-links__row" onClick={() => setOpenType(open ? null : row.type)}>
              <span className="ontology-links__icon">
                <Icon icon={row.icon} size={13} />
              </span>
              <div className="ontology-links__text">
                <div className="ontology-links__type">{row.type}</div>
                <div className="ontology-links__name">{row.name}</div>
                <div className="ontology-links__meta">{row.meta}</div>
              </div>
              {row.statusIntent === "none" ? (
                <span className="ontology-links__status-plain">{row.statusLabel}</span>
              ) : (
                <Tag minimal round intent={row.statusIntent}>
                  {row.statusLabel}
                </Tag>
              )}
              <Icon icon={open ? "chevron-up" : "chevron-down"} size={12} className="ontology-links__chevron" />
            </button>
            {open && <div className="ontology-links__detail">{row.detail}</div>}
          </div>
        );
        })
      )}
    </div>
  );
}
