import { useState } from "react";
import { Button, Callout, Icon, Radio, RadioGroup, Spinner, Tooltip } from "@blueprintjs/core";
import type { Lead } from "../../types";
import { getEnrichmentData } from "../../lib/enrichment";
import { OntologyLinks } from "./OntologyLinks";

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function confidenceColor(value: number): string {
  if (value >= 85) return "#238551";
  if (value >= 70) return "#C87619";
  return "#CD4246";
}

function hash(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

// Ranked so the first (pre-selected) candidate always reads as the best match —
// stable per lead+candidate, not random per render.
function matchConfidence(leadId: string, candidate: string, index: number): number {
  return Math.max(40, 88 - index * 22 - hash(leadId + candidate, 12));
}

interface EnrichmentSectionProps {
  lead: Lead;
  onCorrectMatch: (leadId: string) => void;
  onResolveAmbiguous: (leadId: string, resolution: string | "new") => void;
}

export function EnrichmentSection({ lead, onCorrectMatch, onResolveAmbiguous }: EnrichmentSectionProps) {
  const [recalculating, setRecalculating] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>(lead.candidateAccounts[0] ?? "");
  const data = getEnrichmentData(lead);

  function handleFlip() {
    setRecalculating(true);
    setTimeout(() => {
      onCorrectMatch(lead.id);
      setRecalculating(false);
    }, 600);
  }

  if (lead.accountMatch === "ambiguous") {
    return (
      <div className="enrichment-section">
        <Callout intent="warning" icon="help" title="Ambiguous match">
          Multiple accounts could match {lead.company}. Pick the right one to continue automatically.
        </Callout>

        <RadioGroup selectedValue={selectedCandidate} onChange={(e) => setSelectedCandidate(e.currentTarget.value)}>
          {lead.candidateAccounts.map((candidate, i) => {
            const confidence = matchConfidence(lead.id, candidate, i);
            return (
              <Radio key={candidate} value={candidate}>
                <span className="enrichment-section__candidate">
                  {candidate}
                  <span className="enrichment-section__candidate-confidence" style={{ color: confidenceColor(confidence) }}>
                    {confidence}% match
                  </span>
                </span>
              </Radio>
            );
          })}
        </RadioGroup>

        <div className="enrichment-section__ambiguous-actions">
          <Button intent="primary" text="Confirm match" disabled={!selectedCandidate} onClick={() => onResolveAmbiguous(lead.id, selectedCandidate)} />
          <Button minimal text="None of these — create new" onClick={() => onResolveAmbiguous(lead.id, "new")} />
        </div>

        <OntologyLinks lead={lead} />
      </div>
    );
  }

  return (
    <div className="enrichment-section">
      {lead.accountMatch === "matched" ? (
        <Callout intent="primary" icon="tick" title="Matched to existing account">
          Linked to <strong>{lead.company}</strong> via {lead.email}.
        </Callout>
      ) : (
        <Callout intent="warning" icon="new-object" title="New account">
          No existing match for {lead.company} — a new Account object will be created on sync.
        </Callout>
      )}

      {recalculating ? (
        <div className="enrichment-section__recalculating">
          <Spinner size={14} />
          <span>Recalculating score…</span>
        </div>
      ) : (
        <Button
          minimal
          small
          icon="swap-horizontal"
          text={lead.accountMatch === "matched" ? "Not right? Flag as new" : "Actually, this matches an account"}
          onClick={handleFlip}
        />
      )}

      <OntologyLinks lead={lead} />

      <div className="provenance">
        <div className="provenance__header">
          <span>Firmographics</span>
          <span className="provenance__verified">
            <Icon icon="updated" size={11} /> Verified {relativeTime(data.verifiedAt)}
          </span>
        </div>
        {data.fields.map((f) => (
          <div className="provenance__row" key={f.key}>
            <span className="provenance__label">{f.label}</span>
            <strong className="provenance__value">{f.value}</strong>
            <Tooltip content={`Source: ${f.source} · confidence ${f.confidence}% — feeds prioritization and routing`} placement="left">
              <span className="provenance__meta">
                <span className="provenance__source">{f.source}</span>
                <span className="provenance__confidence" style={{ color: confidenceColor(f.confidence) }}>
                  {f.confidence}%
                </span>
              </span>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
