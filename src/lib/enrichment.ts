import type { Lead } from "../types";

const INDUSTRIES = ["Retail", "Logistics", "Financial Services", "Technology", "Healthcare", "Manufacturing"];
const EMPLOYEE_BANDS = ["1–10", "11–50", "51–200", "201–500", "501–1,000", "1,001–5,000"];
const LOCATIONS = ["Jakarta, ID", "Surabaya, ID", "Bandung, ID", "Medan, ID", "Semarang, ID", "Denpasar, ID"];

function hashIndex(id: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

export type Segment = "Enterprise" | "Mid-market" | "SMB";

export interface EnrichmentField {
  key: string;
  label: string;
  value: string;
  source: string;
  confidence: number; // 0-100
}

export interface EnrichmentData {
  industry: string;
  employeeBand: string;
  hqLocation: string;
  region: string; // city only — what territory routing matches on
  segment: Segment;
  annualRevenueUsd: number;
  engagementEvents: number;
  verifiedAt: string; // ISO
  fields: EnrichmentField[];
}

export function getEnrichmentData(lead: Lead): EnrichmentData {
  const industry = INDUSTRIES[hashIndex(lead.id, INDUSTRIES.length)];
  const bandIndex = hashIndex(lead.id + "e", EMPLOYEE_BANDS.length);
  const employeeBand = EMPLOYEE_BANDS[bandIndex];
  const hqLocation = LOCATIONS[hashIndex(lead.id + "l", LOCATIONS.length)];
  const region = hqLocation.split(",")[0];
  const segment: Segment = bandIndex >= 4 ? "Enterprise" : bandIndex >= 2 ? "Mid-market" : "SMB";
  const annualRevenueUsd = (hashIndex(lead.id + "r", 48) + 2) * 250_000;
  const engagementEvents = hashIndex(lead.id + "g", 12) + 1;

  const verified = new Date(lead.createdAt);
  verified.setMinutes(verified.getMinutes() + 2);

  const conf = (salt: string, floor: number) => floor + hashIndex(lead.id + salt, 100 - floor);

  return {
    industry,
    employeeBand,
    hqLocation,
    region,
    segment,
    annualRevenueUsd,
    engagementEvents,
    verifiedAt: verified.toISOString(),
    fields: [
      { key: "industry", label: "Industry", value: industry, source: "Clearbit", confidence: conf("ci", 90) },
      { key: "employees", label: "Employees", value: employeeBand, source: "Clearbit", confidence: conf("ce", 85) },
      { key: "hq", label: "HQ Location", value: hqLocation, source: "Clearbit", confidence: conf("ch", 88) },
      { key: "revenue", label: "Est. Annual Revenue", value: formatUsd(annualRevenueUsd), source: "Clearbit (modeled)", confidence: conf("cr", 60) },
      { key: "engagement", label: "Engagement Events", value: String(engagementEvents), source: "Tantira activity", confidence: 99 },
    ],
  };
}

export function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}K`;
}
