import type { IntakeItem, IntakeSource } from "../types";

function minutesAgo(n: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d.toISOString();
}

export const INITIAL_INTAKE_SOURCES: IntakeSource[] = [
  { id: "src-form", name: "Website Form", kind: "form", status: "healthy", received: 214, extracted: 209, collapsedDuplicates: 4, lastEventAt: minutesAgo(6) },
  { id: "src-email", name: "Email Inbox", kind: "email", status: "healthy", received: 482, extracted: 461, collapsedDuplicates: 9, lastEventAt: minutesAgo(3) },
  { id: "src-ads", name: "LinkedIn Ads", kind: "ads", status: "healthy", received: 138, extracted: 136, collapsedDuplicates: 2, lastEventAt: minutesAgo(22) },
  { id: "src-partner", name: "Partner Referral", kind: "partner", status: "delayed", received: 41, extracted: 37, collapsedDuplicates: 0, lastEventAt: minutesAgo(260) },
  { id: "src-api", name: "API", kind: "api", status: "healthy", received: 96, extracted: 96, collapsedDuplicates: 0, lastEventAt: minutesAgo(1) },
  { id: "src-webinar", name: "Webinar", kind: "event", status: "paused", received: 0, extracted: 0, collapsedDuplicates: 0, lastEventAt: minutesAgo(60 * 24 * 3) },
];

export const INITIAL_INTAKE_ITEMS: IntakeItem[] = [
  {
    id: "in-1",
    sourceId: "src-email",
    kind: "ambiguous_person",
    receivedAt: minutesAgo(14),
    snippet: "Hi, this is Dewi from procurement — we're evaluating triage tools for our Jakarta office, can someone call me this week? — Dewi",
    name: "Dewi",
    email: "dewi.p@majutek.co.id",
    company: "Majutek",
    candidates: ["Dewi Puspita — Majutek (existing contact)", "Dewi Prasetyo — Majutek Group (existing contact)", "New person"],
  },
  {
    id: "in-2",
    sourceId: "src-form",
    kind: "missing_company",
    receivedAt: minutesAgo(41),
    snippet: "Name: Bagus Wirawan · Email: bagus.w@gmail.com · Message: interested in the enterprise plan for ~300 reps",
    name: "Bagus Wirawan",
    email: "bagus.w@gmail.com",
    company: null,
    candidates: [],
  },
  {
    id: "in-3",
    sourceId: "src-email",
    kind: "duplicate",
    receivedAt: minutesAgo(67),
    snippet: "Re: Follow-up — Citra here again from Beringin Capital, resending the deck request from last week.",
    name: "Citra Dewanti",
    email: "citra@beringincapital.co",
    company: "Beringin Capital",
    candidates: ["LD-1002 · Citra Dewanti — Beringin Capital (open, Hot)"],
  },
  {
    id: "in-4",
    sourceId: "src-partner",
    kind: "ambiguous_person",
    receivedAt: minutesAgo(300),
    snippet: "Partner referral: contact 'A. Santoso' at Kirana — high priority, wants pricing.",
    name: "A. Santoso",
    email: "a.santoso@kirana.co.id",
    company: "Kirana Logistics",
    candidates: ["Bimo Santoso — Kirana Logistics (existing lead LD-1001)", "New person"],
  },
  {
    id: "in-5",
    sourceId: "src-ads",
    kind: "missing_company",
    receivedAt: minutesAgo(380),
    snippet: "LinkedIn lead form: Rani Oktaviani · rani.okt@outlook.com · title: Head of Sales Ops · company field left blank",
    name: "Rani Oktaviani",
    email: "rani.okt@outlook.com",
    company: null,
    candidates: [],
  },
];
