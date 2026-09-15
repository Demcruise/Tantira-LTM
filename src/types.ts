export type Priority = "Hot" | "Warm" | "Cold";
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Assigned" | "Lost";
export type WritebackState = "idle" | "syncing" | "synced" | "failed";
export type Outcome = "Won" | "Lost" | "No response";

export type LeadActionType = "contact" | "qualify" | "disqualify" | "snooze" | "nurture" | "escalate";

export type DownstreamKind = "onboarding" | "nurture" | "re_engagement";

export interface DownstreamSequence {
  kind: DownstreamKind;
  startedAt: string; // ISO
}

export const WON_REASONS = ["Product fit", "Fast response", "Strong relationship", "Pricing fit"] as const;
export const LOST_REASONS = ["Chose competitor", "No budget", "Timing", "Wrong fit", "No response"] as const;

export interface LeadActionEvent {
  type: LeadActionType;
  time: string; // ISO
  actor: string;
}

export type OverrideReason = "Existing relationship" | "Territory ownership" | "Rep specialization" | "Capacity" | "Other";

export interface RecommendationDecision {
  status: "accepted" | "overridden";
  recommendedOwner: string | null;
  chosenOwner: string;
  reason?: OverrideReason;
  decidedAt: string; // ISO
  decidedBy: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  score: number; // 0-100, drives priority
  priority: Priority;
  status: LeadStatus;
  assignedTo: string | null;
  writebackState: WritebackState;
  syncedAt: string | null; // ISO, set when writebackState becomes "synced"
  inNurture: boolean; // downstream nurture sequence, auto-set after sync
  downstream: DownstreamSequence | null; // which downstream automation owns this lead now
  outcome: Outcome | null;
  outcomeReason: string | null; // why it was won / lost — feeds model feedback
  accountMatch: "matched" | "new" | "ambiguous"; // enrichment: linked, net-new, or needs human pick
  candidateAccounts: string[]; // populated only when accountMatch === "ambiguous"
  createdAt: string; // ISO
  lastActivity: string; // ISO
  snoozedUntil: string | null; // ISO — hidden from queues until then
  actions: LeadActionEvent[]; // human actions taken on this lead, newest last
  decision: RecommendationDecision | null; // how the owner recommendation was resolved
}

export interface KpiSummary {
  totalLeads: number;
  newToday: number;
  unassigned: number;
  avgScore: number;
}

export const SLA_HOURS_BY_PRIORITY: Record<Priority, number> = {
  Hot: 1,
  Warm: 4,
  Cold: 24,
};

// --- Enterprise admin: Team Members ---

export type MemberRole = "Admin" | "Sales Ops" | "Rep";
export type MemberStatus = "Active" | "Pending";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
}

export const SYSTEM_ROLES: MemberRole[] = ["Admin", "Sales Ops", "Rep"];

// --- Enterprise admin: Audit Log ---

export type AuditActor = { type: "user"; name: string } | { type: "system" };

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO
  actor: AuditActor;
  action: string;
  object: string;
  before?: string;
  after?: string;
  ip: string;
  userAgent: string;
}

// --- Enterprise admin: SSO ---

export type SsoProvider = "Okta" | "Azure AD" | "Google Workspace" | "Custom SAML";
export type SsoStatus = "Not configured" | "Configured, not enabled" | "Active";

export interface AttributeMap {
  email: string;
  role: string;
  department: string;
}

export interface SsoConfig {
  provider: SsoProvider | null;
  metadataMethod: "upload" | "url" | null;
  metadataValue: string; // filename if upload, URL if url
  attributeMap: AttributeMap;
  testPassed: boolean;
  enabled: boolean;
}

export function ssoStatus(config: SsoConfig): SsoStatus {
  if (config.enabled) return "Active";
  if (config.provider) return "Configured, not enabled";
  return "Not configured";
}

// --- Enterprise admin: API Keys ---

export type ApiKeyScope = "Read only" | "Read+Write";

export interface ApiKey {
  id: string;
  name: string;
  maskedKey: string; // e.g. tk_live_****7f2a
  scope: ApiKeyScope;
  lastUsed: string | null; // ISO, null = never used
  createdAt: string; // ISO
}

// --- Notifications ---

export interface AppNotification {
  id: string;
  title: string;
  subtitle: string; // actor name or "by Admin"
  time: string; // ISO
  read: boolean;
  leadId?: string; // deep-links into the Lead Detail Drawer
  reason?: AttentionReason; // shows a ReasonBadge, matches the Attention Center taxonomy
  auditSearch?: string; // deep-links into a filtered Audit Log view
}

export type NotificationChannel = "inApp" | "email";

export interface NotificationPrefDef {
  key: string;
  label: string;
}

export type NotificationPrefMatrix = Record<string, Record<NotificationChannel, boolean>>;

export type AttentionReason = "sync_conflict" | "rep_over_capacity" | "ambiguous_match" | "sla_at_risk" | "awaiting_assignment";

// --- Inbound / intake ---

export type IntakeSourceStatus = "healthy" | "delayed" | "paused";

export interface IntakeSource {
  id: string;
  name: string;
  kind: "email" | "form" | "ads" | "partner" | "api" | "event";
  status: IntakeSourceStatus;
  received: number; // last 7 days
  extracted: number; // became leads automatically
  collapsedDuplicates: number; // merged at capture, no human needed
  lastEventAt: string; // ISO
}

export type IntakeItemKind = "ambiguous_person" | "missing_company" | "duplicate";

export interface IntakeItem {
  id: string;
  sourceId: string;
  kind: IntakeItemKind;
  receivedAt: string; // ISO
  snippet: string; // raw inbound text the extractor worked from
  name: string;
  email: string;
  company: string | null;
  candidates: string[]; // account or existing-lead candidates, depending on kind
}

// --- Automation: Assignment Rules ---

export type ConditionField = "score" | "priority" | "source" | "status" | "company";
export type ConditionOperator = ">" | "<" | "=" | "!=" | "contains";

export interface Condition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number;
}

export type AssignTargetType = "rep" | "queue" | "round_robin";

export interface AssignTarget {
  type: AssignTargetType;
  repId?: string;
  queueId?: string;
  roundRobinGroup?: string[];
  capacityAware: boolean;
}

export interface AssignmentRule {
  id: string;
  priority: number;
  conditions: Condition[];
  conditionLogic: "AND" | "OR";
  assignTarget: AssignTarget;
  status: "active" | "inactive";
  isCatchAll: boolean;
  lastModifiedBy: string;
  lastModifiedAt: string; // ISO
}

export interface SampleLeadInput {
  score: number;
  priority: Priority;
  source: string;
  status: LeadStatus;
  company: string;
}

// --- Automation: Prioritization Model ---

export interface ScoringRule {
  id: string;
  description: string;
  points: number; // can be negative
  status: "active" | "inactive";
}

export interface TierThresholds {
  hotMin: number;
  warmMin: number; // coldMax implied as warmMin - 1
}

export interface ScoreBreakdownItem {
  ruleId: string;
  description: string;
  pointsApplied: number;
}

export interface SimulationResult {
  totalScore: number;
  breakdown: ScoreBreakdownItem[];
  resultingTier: Priority;
}

// --- Auto-Processed Log (LTM automation trust log) ---

export type AutoProcessedEventType = "captured" | "enriched" | "scored" | "synced" | "sync_failed" | "nurture" | "downstream";

export interface AutoProcessedEntry {
  id: string;
  leadId: string;
  leadName: string;
  time: string; // ISO
  eventType: AutoProcessedEventType;
  label: string;
  detail?: string;
}

// --- Connections / CRM Sync Health ---

export type ConnectionStatus = "healthy" | "degraded" | "disconnected";
export type ConflictResolution = "keep_crm" | "keep_tantira" | "merge";

export interface SyncConflict {
  id: string;
  leadId: string;
  leadName: string;
  field: string;
  crmValue: string;
  tantiraValue: string;
}

export interface CrmConnection {
  id: string;
  name: string;
  status: ConnectionStatus;
  lastSyncAt: string; // ISO — last successful sync regardless of current status
  pendingCount: number;
  conflicts: SyncConflict[];
}
