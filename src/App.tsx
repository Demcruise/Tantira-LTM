import { useEffect, useMemo, useState } from "react";
import { mockLeads } from "./data/mockLeads";
import type { ActivityChannel, Lead, LeadActionType, Outcome, OverrideReason } from "./types";
import { KpiRow } from "./components/KpiRow";
import { ActionBanner } from "./components/ActionBanner";
import { FiltersBar, type Filters } from "./components/FiltersBar";
import { LeadsTable } from "./components/LeadsTable";
import { BulkActionBar, type BulkAction } from "./components/BulkActionBar";
import { LeadDetailPanel } from "./components/LeadDetailPanel";
import { WorkflowPage } from "./pages/WorkflowPage";
import { AssignmentPage } from "./pages/AssignmentPage";
import { PipelineHealthPage } from "./pages/PipelineHealthPage";
import { TeamMembersPage } from "./pages/TeamMembersPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { RolesPermissionsPage } from "./pages/RolesPermissionsPage";
import { SsoPage } from "./pages/SsoPage";
import { ApiKeysPage } from "./pages/ApiKeysPage";
import { NotificationPreferencesPage } from "./pages/NotificationPreferencesPage";
import { AssignmentRulesPage } from "./pages/AssignmentRulesPage";
import { PrioritizationModelPage } from "./pages/PrioritizationModelPage";
import { AutoProcessedLogPage } from "./pages/AutoProcessedLogPage";
import { ConnectionsPage } from "./pages/ConnectionsPage";
import { NeedsAttentionPage } from "./pages/NeedsAttentionPage";
import { CommandCenterPage } from "./pages/CommandCenterPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { MyLeadsPage } from "./pages/MyLeadsPage";
import { PerformancePage } from "./pages/PerformancePage";
import { IntakePage, type IntakeResolution } from "./pages/IntakePage";
import { INITIAL_INTAKE_ITEMS, INITIAL_INTAKE_SOURCES } from "./data/intake";
import type { IntakeItem } from "./types";
import { recommendFor } from "./lib/recommendation";
import { CHANNEL_META, LEAD_ACTION_META } from "./lib/leadActions";
import { LeadsAreaTabs } from "./components/needs-attention/LeadsAreaTabs";
import { LoginPage } from "./pages/LoginPage";
import AppSidebar4, { type AppView, type FilterPreset } from "./components/app-sidebar-4";
import { AppHeader } from "./components/AppHeader";
import { PageHeader } from "./components/PageHeader";
import { REPS } from "./data/reps";
import { CURRENT_USER, INITIAL_TEAM } from "./data/team";
import { hasPermission, INITIAL_MATRIX, INITIAL_ROLES, PERMISSIONS, resolveRoleId, type PermissionKey, type PermissionMatrix, type RoleDef } from "./data/permissions";
import { INITIAL_SSO_CONFIG } from "./data/sso";
import { INITIAL_API_KEYS, generateApiKey } from "./data/apiKeys";
import { SEED_NOTIFICATIONS } from "./data/notifications";
import { INITIAL_NOTIFICATION_PREFS } from "./data/notificationPrefs";
import { INITIAL_ASSIGNMENT_RULES } from "./data/assignmentRules";
import { INITIAL_SCORING_RULES, INITIAL_TIER_THRESHOLDS } from "./data/scoringRules";
import { landingViewForRole } from "./lib/roleLanding";
import { INITIAL_CONNECTIONS } from "./data/connections";
import { assignByRules, summarizeConditions, summarizeTarget } from "./lib/ruleEngine";
import type { SuggestedActionKey } from "./components/lead-detail/SuggestedAction";
import type {
  ApiKey,
  ApiKeyScope,
  AppNotification,
  AssignmentRule,
  AttributeMap,
  AuditLogEntry,
  ConflictResolution,
  CrmConnection,
  MemberRole,
  NotificationChannel,
  NotificationPrefMatrix,
  ScoringRule,
  SsoConfig,
  SsoProvider,
  TeamMember,
  TierThresholds,
} from "./types";
import { ssoStatus } from "./types";
import { clampScore, scoreToPriority } from "./lib/scoring";
import type { WorkflowNode } from "./lib/workflowNodes";
import type { WorkflowVersion } from "./lib/workflowLifecycle";
import { createAuditEntry, SEED_AUDIT_LOG } from "./lib/auditLog";
import { buildAutoProcessedLog } from "./lib/autoProcessedLog";
import { AppToaster } from "./lib/toaster";

const ASSIGNEES = REPS.map((r) => r.name);

const EMPTY_FILTERS: Filters = { search: "", status: "All", priority: "All", assignee: "All" };
const ITEM_LABEL: Record<IntakeItem["kind"], string> = { ambiguous_person: "Ambiguous person", missing_company: "Missing company", duplicate: "Possible duplicate" };

export function App() {
  const [view, setView] = useState<AppView>("dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(SEED_AUDIT_LOG);
  const [roles, setRoles] = useState<RoleDef[]>(INITIAL_ROLES);
  const [matrix, setMatrix] = useState<PermissionMatrix>(INITIAL_MATRIX);
  const [ssoConfig, setSsoConfig] = useState<SsoConfig>(INITIAL_SSO_CONFIG);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [acknowledgedOverrideIds, setAcknowledgedOverrideIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [auditSearchSeed, setAuditSearchSeed] = useState("");
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
  const [workflowVersions, setWorkflowVersions] = useState<WorkflowVersion[]>(() => {
    const d = new Date();
    d.setHours(d.getHours() - 3);
    return [{ version: 1, nodes: [], publishedAt: d.toISOString(), publishedBy: "Rina Cahyani", note: "Initial triage flow" }];
  });
  const publishedWorkflow = workflowVersions.reduce((a, b) => (b.version > a.version ? b : a));
  const [viewingAsRep, setViewingAsRep] = useState(ASSIGNEES[0]);
  const [checkedLeadIds, setCheckedLeadIds] = useState<Set<string>>(new Set());
  const [intakeItems, setIntakeItems] = useState<IntakeItem[]>(INITIAL_INTAKE_ITEMS);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefMatrix>(INITIAL_NOTIFICATION_PREFS);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>(INITIAL_ASSIGNMENT_RULES);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>(INITIAL_SCORING_RULES);
  const [tierThresholds, setTierThresholds] = useState<TierThresholds>(INITIAL_TIER_THRESHOLDS);
  const [connections, setConnections] = useState<CrmConnection[]>(INITIAL_CONNECTIONS);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [autoLogSearchSeed, setAutoLogSearchSeed] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLeads(mockLeads);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredLeads = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (search) {
        const haystack = `${lead.name} ${lead.company} ${lead.email}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (filters.status === "Open" ? lead.status === "Lost" : filters.status !== "All" && lead.status !== filters.status) return false;
      if (filters.priority !== "All" && lead.priority !== filters.priority) return false;
      if (filters.assignee === "Unassigned" && lead.assignedTo !== null) return false;
      if (filters.assignee !== "All" && filters.assignee !== "Unassigned" && lead.assignedTo !== filters.assignee) {
        return false;
      }
      return true;
    });
  }, [leads, filters]);

  const summary = useMemo(() => {
    const today = new Date().toDateString();
    return {
      totalLeads: leads.length,
      newToday: leads.filter((l) => new Date(l.createdAt).toDateString() === today).length,
      unassigned: leads.filter((l) => l.assignedTo === null).length,
      avgScore: leads.length ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
    };
  }, [leads]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? null;

  const selectedLeadConflict = useMemo(() => {
    if (!selectedLead) return null;
    for (const c of connections) {
      const found = c.conflicts.find((cf) => cf.leadId === selectedLead.id);
      if (found) return { ...found, connectionId: c.id, connectionName: c.name };
    }
    return null;
  }, [selectedLead, connections]);

  const autoProcessedLog = useMemo(() => buildAutoProcessedLog(leads), [leads]);

  const currentUserPermissions = useMemo(() => {
    const roleName = members.find((m) => m.name === CURRENT_USER)?.role;
    const roleId = roleName ? resolveRoleId(roles, roleName) : undefined;
    return new Set<PermissionKey>(PERMISSIONS.filter((p) => hasPermission(matrix, roleId, p.key)).map((p) => p.key));
  }, [members, roles, matrix]);

  const selectedRecommendation = useMemo(
    () => (selectedLead ? recommendFor(selectedLead, leads, assignmentRules, tierThresholds) : null),
    [selectedLead, leads, assignmentRules, tierThresholds],
  );

  function handleOpenLeadFromLog(leadId: string) {
    setSelectedLeadId(leadId);
  }

  function navigateTo(next: AppView, filterPreset?: FilterPreset) {
    setAuditSearchSeed("");
    setAutoLogSearchSeed("");
    setCheckedLeadIds(new Set());
    if (filterPreset) {
      setFilters({ ...EMPTY_FILTERS, ...filterPreset });
    }
    setView(next);
  }

  const processedThisWeek = autoProcessedLog.filter((e) => Date.now() - new Date(e.time).getTime() <= 7 * 24 * 60 * 60 * 1000).length;

  function ssoAvailableForEmail(email: string) {
    return email.toLowerCase().endsWith("@tantira.co") && ssoConfig.enabled;
  }

  function handleLogin(email: string) {
    setAuthenticated(true);
    const member = members.find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
    setView(landingViewForRole(member?.role));
  }

  function handleLogout() {
    setAuthenticated(false);
    setSelectedLeadId(null);
  }

  function runWriteback(leadId: string) {
    setTimeout(() => {
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== leadId) return l;
          const succeeds = Math.random() > 0.3;
          if (succeeds) {
            const syncedAt = new Date().toISOString();
            return { ...l, writebackState: "synced", syncedAt, inNurture: true, downstream: l.downstream ?? { kind: "nurture", startedAt: syncedAt } };
          }
          return { ...l, writebackState: "failed" };
        }),
      );
    }, 1400);
  }

  function handleAssign(leadId: string, assignee: string) {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, assignedTo: assignee, status: "Assigned", writebackState: "syncing" } : l)),
    );
    runWriteback(leadId);
  }

  function handleRetrySync(leadId: string) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, writebackState: "syncing" } : l)));
    runWriteback(leadId);
  }

  function handleLogOutcome(leadId: string, outcome: Outcome, reason: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, outcome, outcomeReason: reason, lastActivity: new Date().toISOString() } : l)));
    logAction("Logged outcome", lead.name, lead.priority, `${outcome} — ${reason}`);
    AppToaster.show({
      icon: "flag",
      intent: outcome === "Won" ? "success" : "none",
      message: `${outcome} (${reason}) recorded for ${lead.name}. Counted against its ${lead.priority} prediction in Model feedback.`,
    });
  }

  function handleSuggestedAction(leadId: string, action: SuggestedActionKey) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    if (action === "escalate") {
      logAction("Escalated for manager follow-up", lead.name, "No response", "Flagged for review");
      setNotifications((prev) => [
        { id: `N-${Date.now()}`, title: "Escalation raised", subtitle: lead.name, time: new Date().toISOString(), read: false, leadId, reason: "sla_at_risk" },
        ...prev,
      ]);
      AppToaster.show({ icon: "warning-sign", intent: "warning", message: `${lead.name} flagged for manager review — notification sent.` });
      return;
    }

    const label = action === "onboarding" ? "Kicked off onboarding sequence" : "Added to re-engagement nurture";
    const downstream = { kind: action === "onboarding" ? ("onboarding" as const) : ("re_engagement" as const), startedAt: new Date().toISOString() };
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, inNurture: true, downstream } : l)));
    logAction(label, lead.name);
    AppToaster.show({ icon: "send-to", intent: "success", message: `${label} for ${lead.name}. Tracking it in the Auto-Processed Log.` });
    setSelectedLeadId(null);
    setAutoLogSearchSeed(lead.name);
    setView("auto-processed-log");
  }

  function handleAcceptRecommendation(leadId: string, owner: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const rec = recommendFor(lead, leads, assignmentRules, tierThresholds);
    handleAssign(leadId, owner);
    const decision = {
      status: "accepted" as const,
      recommendedOwner: owner,
      chosenOwner: owner,
      decidedAt: new Date().toISOString(),
      decidedBy: CURRENT_USER,
      confidence: rec.confidence,
      basis: rec.ownerBasis,
      signals: rec.reasons,
    };
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, decision } : l)));
    logAction("Accepted recommendation", lead.name, "Unassigned", owner);
    AppToaster.show({ icon: "thumbs-up", intent: "success", message: `${lead.name} assigned to ${owner}. Writeback started — it will appear in ${owner}'s My Leads.` });
  }

  function handleOverrideRecommendation(leadId: string, owner: string, reason: OverrideReason) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const rec = recommendFor(lead, leads, assignmentRules, tierThresholds);
    handleAssign(leadId, owner);
    const decision = {
      status: "overridden" as const,
      recommendedOwner: rec.owner,
      chosenOwner: owner,
      reason,
      decidedAt: new Date().toISOString(),
      decidedBy: CURRENT_USER,
      confidence: rec.confidence,
      basis: rec.ownerBasis,
      signals: rec.reasons,
    };
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, decision } : l)));
    logAction("Overrode recommendation", lead.name, rec.owner ?? "No recommendation", `${owner} — ${reason}`);
    AppToaster.show({ icon: "swap-horizontal", intent: "primary", message: `Override recorded (${reason}). ${lead.name} assigned to ${owner}.` });
  }

  function handleAcknowledgeOverride(leadId: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setAcknowledgedOverrideIds((prev) => new Set(prev).add(leadId));
    logAction("Acknowledged override", lead.name, "Unreviewed", "Reviewed");
  }

  function handleLeadAction(leadId: string, type: LeadActionType) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const now = new Date().toISOString();
    const patch: Partial<Lead> = { actions: [...lead.actions, { type, time: now, actor: CURRENT_USER }], lastActivity: now };
    switch (type) {
      case "contact":
        patch.status = "Contacted";
        break;
      case "qualify":
        patch.status = "Qualified";
        break;
      case "disqualify":
        patch.status = "Lost";
        patch.outcome = "Lost";
        break;
      case "snooze": {
        const until = new Date();
        until.setDate(until.getDate() + 1);
        patch.snoozedUntil = until.toISOString();
        break;
      }
      case "nurture":
        patch.inNurture = true;
        patch.downstream = lead.downstream ?? { kind: "nurture", startedAt: now };
        break;
      case "escalate":
        setNotifications((prev) => [
          { id: `N-${Date.now()}`, title: "Escalation raised", subtitle: lead.name, time: now, read: false, leadId, reason: "sla_at_risk" },
          ...prev,
        ]);
        break;
    }
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...patch } : l)));
    logAction(LEAD_ACTION_META[type].pastLabel, lead.name, lead.status, patch.status ?? lead.status);
    AppToaster.show({ icon: LEAD_ACTION_META[type].icon, intent: LEAD_ACTION_META[type].intent ?? "success", message: `${LEAD_ACTION_META[type].pastLabel}: ${lead.name}` });
  }

  function handleLogActivity(leadId: string, payload: { channel: ActivityChannel; note: string; followUpDueAt: string | null }) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const now = new Date().toISOString();
    const patch: Partial<Lead> = {
      actions: [...lead.actions, { type: "contact", time: now, actor: CURRENT_USER, channel: payload.channel, note: payload.note || undefined }],
      lastActivity: now,
      status: lead.status === "New" ? "Contacted" : lead.status,
      followUpDueAt: payload.followUpDueAt ?? lead.followUpDueAt,
    };
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...patch } : l)));
    logAction(`Logged ${CHANNEL_META[payload.channel].label.toLowerCase()}`, lead.name, lead.status, patch.status ?? lead.status);
    AppToaster.show({
      icon: CHANNEL_META[payload.channel].icon,
      intent: "primary",
      message: payload.followUpDueAt
        ? `Logged ${CHANNEL_META[payload.channel].label.toLowerCase()} with ${lead.name}. Follow-up scheduled.`
        : `Logged ${CHANNEL_META[payload.channel].label.toLowerCase()} with ${lead.name}.`,
    });
  }

  function handleResolveIntake(itemId: string, resolution: IntakeResolution) {
    const item = intakeItems.find((i) => i.id === itemId);
    if (!item) return;
    const source = INITIAL_INTAKE_SOURCES.find((s) => s.id === item.sourceId);
    setIntakeItems((prev) => prev.filter((i) => i.id !== itemId));

    if (resolution.action === "create") {
      const score = clampScore(35 + ((item.name.length * 7 + item.email.length * 3) % 55));
      const now = new Date().toISOString();
      const lead: Lead = {
        id: `LD-${2000 + (Date.now() % 1000)}`,
        name: item.name,
        company: resolution.company || item.company || "Unknown",
        email: item.email,
        source: source?.name ?? "Inbound",
        score,
        priority: scoreToPriority(score, tierThresholds),
        status: "New",
        assignedTo: null,
        writebackState: "idle",
        syncedAt: null,
        inNurture: false,
        downstream: null,
        outcome: null,
        outcomeReason: null,
        accountMatch: resolution.matchedExisting ? "matched" : "new",
        candidateAccounts: [],
        createdAt: now,
        lastActivity: now,
        snoozedUntil: null,
        followUpDueAt: null,
        actions: [],
        decision: null,
      };
      setLeads((prev) => [lead, ...prev]);
      logAction("Resolved inbound item", `${item.name} (${source?.name ?? "Inbound"})`, ITEM_LABEL[item.kind], `Created lead ${lead.id}`);
      AppToaster.show({
        icon: "new-person",
        intent: "success",
        message: `${lead.name} is now a ${lead.priority} lead — enriched and waiting for an owner in the Attention Center.`,
      });
      return;
    }
    if (resolution.action === "merge") {
      const target = leads.find((l) => l.id === resolution.targetLeadId);
      if (target) {
        setLeads((prev) => prev.map((l) => (l.id === target.id ? { ...l, lastActivity: new Date().toISOString() } : l)));
      }
      logAction("Resolved inbound item", `${item.name} (${source?.name ?? "Inbound"})`, "Possible duplicate", `Merged into ${resolution.targetLeadId}`);
      AppToaster.show({ icon: "git-merge", intent: "success", message: `Merged into ${target?.name ?? resolution.targetLeadId} — activity updated, no duplicate created.` });
      return;
    }
    const label = resolution.action === "keep_separate" ? "Kept as separate lead" : "Discarded";
    logAction("Resolved inbound item", `${item.name} (${source?.name ?? "Inbound"})`, ITEM_LABEL[item.kind], label);
    AppToaster.show({ icon: "tick", intent: "none", message: `${label}: ${item.name}.` });
  }

  function handlePublishWorkflow(nodes: WorkflowNode[]) {
    const version = publishedWorkflow.version + 1;
    const entry: WorkflowVersion = { version, nodes: JSON.parse(JSON.stringify(nodes)), publishedAt: new Date().toISOString(), publishedBy: CURRENT_USER, note: `${nodes.length} custom step${nodes.length === 1 ? "" : "s"}` };
    setWorkflowVersions((prev) => [...prev, entry]);
    logAction("Published workflow", "Lead Triage Workflow", `v${publishedWorkflow.version}`, `v${version}`);
    AppToaster.show({ icon: "cloud-upload", intent: "success", message: `Lead Triage Workflow v${version} is live. Every lead captured from now on runs it.` });
  }

  function handleRollbackWorkflow() {
    const previous = workflowVersions.filter((v) => v.version < publishedWorkflow.version).sort((a, b) => b.version - a.version)[0];
    if (!previous) return;
    setWorkflowVersions((prev) => prev.filter((v) => v.version !== publishedWorkflow.version));
    setWorkflowNodes(JSON.parse(JSON.stringify(previous.nodes)));
    logAction("Rolled back workflow", "Lead Triage Workflow", `v${publishedWorkflow.version}`, `v${previous.version}`);
    AppToaster.show({ icon: "reset", intent: "warning", message: `Rolled back to v${previous.version}. v${publishedWorkflow.version} is no longer running.` });
  }

  function handleBulkAction(action: BulkAction) {
    const targets = leads.filter((l) => checkedLeadIds.has(l.id));
    if (targets.length === 0) return;
    const names = targets.map((l) => l.name).join(", ");
    const n = targets.length;
    const plural = `${n} lead${n === 1 ? "" : "s"}`;
    const now = new Date().toISOString();

    switch (action.type) {
      case "assign": {
        setLeads((prev) => prev.map((l) => (checkedLeadIds.has(l.id) && l.status !== "Lost" ? { ...l, assignedTo: action.assignee, status: l.status === "New" ? "Assigned" : l.status, writebackState: "syncing", decision: null } : l)));
        targets.filter((l) => l.status !== "Lost").forEach((l) => runWriteback(l.id));
        logAction("Bulk assigned leads", plural, undefined, `${action.assignee}: ${names}`);
        AppToaster.show({ icon: "person", intent: "success", message: `Assigned ${plural} to ${action.assignee}. Writeback started.` });
        break;
      }
      case "priority": {
        setLeads((prev) => prev.map((l) => (checkedLeadIds.has(l.id) ? { ...l, priority: action.priority } : l)));
        logAction("Bulk changed priority", plural, undefined, `${action.priority}: ${names}`);
        AppToaster.show({ icon: "flame", intent: "primary", message: `${plural} set to ${action.priority}. SLA windows and routing follow the new tier; the scoring model is not changed.` });
        break;
      }
      case "snooze": {
        const until = new Date();
        until.setDate(until.getDate() + 1);
        setLeads((prev) => prev.map((l) => (checkedLeadIds.has(l.id) ? { ...l, snoozedUntil: until.toISOString(), actions: [...l.actions, { type: "snooze", time: now, actor: CURRENT_USER }] } : l)));
        logAction("Bulk snoozed leads", plural, undefined, names);
        AppToaster.show({ icon: "moon", message: `${plural} snoozed for 1 day — hidden from the Attention Center until then.` });
        break;
      }
      case "nurture": {
        setLeads((prev) => prev.map((l) => (checkedLeadIds.has(l.id) ? { ...l, inNurture: true, downstream: l.downstream ?? { kind: "nurture", startedAt: now }, actions: [...l.actions, { type: "nurture", time: now, actor: CURRENT_USER }] } : l)));
        logAction("Bulk moved to nurture", plural, undefined, names);
        AppToaster.show({ icon: "send-to", intent: "success", message: `${plural} entered the nurture sequence. Tracked in the Auto-Processed Log.` });
        break;
      }
      case "reprocess": {
        const retier = targets.filter((l) => scoreToPriority(l.score, tierThresholds) !== l.priority).length;
        const retry = targets.filter((l) => l.assignedTo && l.writebackState === "failed");
        setLeads((prev) =>
          prev.map((l) =>
            checkedLeadIds.has(l.id)
              ? { ...l, priority: scoreToPriority(l.score, tierThresholds), snoozedUntil: null, writebackState: l.assignedTo && l.writebackState === "failed" ? "syncing" : l.writebackState, lastActivity: now }
              : l,
          ),
        );
        retry.forEach((l) => runWriteback(l.id));
        logAction("Bulk reprocessed leads", plural, undefined, `${retier} re-tiered, ${retry.length} writeback${retry.length === 1 ? "" : "s"} retried`);
        AppToaster.show({ icon: "refresh", intent: "primary", message: `Reprocessed ${plural}: ${retier} re-tiered against current thresholds, ${retry.length} failed writeback${retry.length === 1 ? "" : "s"} retried, snoozes cleared.` });
        break;
      }
      case "export": {
        logAction("Exported leads", plural, undefined, "CSV");
        AppToaster.show({ icon: "export", intent: "primary", message: `Preparing CSV for ${plural} — we'll notify you when it's ready.` });
        break;
      }
    }
    if (action.type !== "export") setCheckedLeadIds(new Set());
  }

  function handleAutoAssignUnassigned() {
    const targets = leads.filter((l) => l.status !== "Lost" && l.assignedTo === null);
    const plan = assignByRules(leads, assignmentRules, targets);
    if (plan.length === 0) {
      AppToaster.show({ icon: "info-sign", intent: "none", message: "No unassigned lead matched an active rule with capacity to spare." });
      return;
    }
    const byId = new Map(plan.map((p) => [p.leadId, p]));
    setLeads((prev) =>
      prev.map((l) => (byId.has(l.id) ? { ...l, assignedTo: byId.get(l.id)!.assignee, status: "Assigned", writebackState: "syncing" } : l)),
    );
    plan.forEach((p) => runWriteback(p.leadId));
    const summary = plan.map((p) => `${leads.find((l) => l.id === p.leadId)?.name} → ${p.assignee}`).join("; ");
    logAction("Auto-assigned leads by rules", `${plan.length} lead${plan.length === 1 ? "" : "s"}`, undefined, summary);
    AppToaster.show({
      icon: "tick-circle",
      intent: "success",
      message: `Assigned ${plan.length} lead${plan.length === 1 ? "" : "s"} by rules. CRM writeback started — track it under Connections.`,
    });
  }

  function handleCorrectMatch(leadId: string) {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const flippedMatch = l.accountMatch === "matched" ? "new" : "matched";
        const delta = flippedMatch === "matched" ? 8 : -8;
        const score = clampScore(l.score + delta);
        return { ...l, accountMatch: flippedMatch, score, priority: scoreToPriority(score, tierThresholds) };
      }),
    );
  }

  function logAction(action: string, object: string, before?: string, after?: string) {
    setAuditLog((prev) => [
      createAuditEntry({ actor: { type: "user", name: CURRENT_USER }, action, object, before, after }),
      ...prev,
    ]);
  }

  function handleInviteMember(email: string, role: MemberRole) {
    const id = `TM-${Date.now()}`;
    setMembers((prev) => [...prev, { id, name: email, email, role, status: "Pending" }]);
    logAction("Invited member", email, undefined, `${role}, Pending`);
  }

  function handleChangeRole(memberId: string, role: MemberRole) {
    const member = members.find((m) => m.id === memberId);
    if (!member || member.role === role) return;
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
    logAction("Changed role", member.name, member.role, role);
  }

  function handleResendInvite(memberId: string) {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    logAction("Resent invite", member.email);
  }

  function handleRevokeInvite(memberId: string) {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    logAction("Revoked invite", member.email, `${member.role}, Pending`, "Revoked");
  }

  function handleTogglePermission(roleId: string, permKey: string, granted: boolean) {
    const role = roles.find((r) => r.id === roleId);
    const perm = PERMISSIONS.find((p) => p.key === permKey);
    if (!role || !perm) return;

    setMatrix((prev) => ({ ...prev, [roleId]: { ...prev[roleId], [permKey]: granted } }));
    logAction(
      granted ? "Granted permission" : "Revoked permission",
      `${role.name} — ${perm.module}: ${perm.label}`,
      granted ? "Revoked" : "Granted",
      granted ? "Granted" : "Revoked",
    );
    AppToaster.show({
      icon: granted ? "tick-circle" : "warning-sign",
      intent: granted ? "success" : "warning",
      message: `${granted ? "Granted" : "Revoked"} "${perm.module}: ${perm.label}" ${granted ? "to" : "from"} ${role.name}.`,
    });
  }

  function handleCreateRole(name: string, scope: string | null) {
    const id = `role-${Date.now()}`;
    setRoles((prev) => [...prev, { id, name, system: false, scope }]);
    setMatrix((prev) => ({
      ...prev,
      [id]: Object.fromEntries(PERMISSIONS.map((p) => [p.key, false])),
    }));
    logAction("Created role", name, undefined, scope ? `0 permissions granted, scoped to ${scope}` : "0 permissions granted");
    AppToaster.show({ icon: "new-person", intent: "primary", message: `Created role "${name}"${scope ? ` — scoped to ${scope}` : ""}.` });
  }

  function handleDeleteRole(roleId: string) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    setMatrix((prev) => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });
    logAction("Deleted role", role.name, "Active", "Deleted");
    AppToaster.show({ icon: "trash", intent: "danger", message: `Deleted role "${role.name}".` });
  }

  function handleSelectProvider(provider: SsoProvider) {
    const before = ssoStatus(ssoConfig);
    setSsoConfig((prev) => ({ ...prev, provider, testPassed: false, enabled: false }));
    logAction("SSO config updated", `${provider} IdP`, before, "Configured, not enabled");
  }

  function handleSaveSsoMetadata(method: "upload" | "url", value: string) {
    setSsoConfig((prev) => ({ ...prev, metadataMethod: method, metadataValue: value, testPassed: false }));
    logAction("SSO metadata saved", `${ssoConfig.provider} IdP`, undefined, method === "upload" ? value : "Metadata URL set");
  }

  function handleSaveAttributeMap(map: AttributeMap) {
    setSsoConfig((prev) => ({ ...prev, attributeMap: map, testPassed: false }));
    logAction("SSO attributes mapped", `${ssoConfig.provider} IdP`);
  }

  function handleSsoTestPass() {
    setSsoConfig((prev) => ({ ...prev, testPassed: true }));
    logAction("SSO test login succeeded", `${ssoConfig.provider} IdP`);
  }

  function handleEnableSso() {
    setSsoConfig((prev) => ({ ...prev, enabled: true }));
    logAction("SSO config updated", `${ssoConfig.provider} IdP`, "Configured, not enabled", "Active");
    AppToaster.show({ icon: "tick-circle", intent: "success", message: `SSO is now active via ${ssoConfig.provider}.` });
  }

  function handleDisableSso() {
    setSsoConfig((prev) => ({ ...prev, enabled: false }));
    logAction("SSO config updated", `${ssoConfig.provider} IdP`, "Active", "Configured, not enabled");
    AppToaster.show({ icon: "warning-sign", intent: "warning", message: "SSO disabled. Users can log in with passwords again." });
  }

  function handleGenerateApiKey(name: string, scope: ApiKeyScope): { fullKey: string } {
    const { fullKey, maskedKey } = generateApiKey();
    const id = `AK-${Date.now()}`;
    setApiKeys((prev) => [...prev, { id, name, maskedKey, scope, lastUsed: null, createdAt: new Date().toISOString() }]);
    logAction("API key generated", name, undefined, scope);
    return { fullKey };
  }

  function handleRevokeApiKey(keyId: string) {
    const key = apiKeys.find((k) => k.id === keyId);
    if (!key) return;
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    logAction("API key revoked", key.name, key.maskedKey, "Revoked");
    AppToaster.show({ icon: "key", intent: "danger", message: `Revoked API key "${key.name}".` });
  }

  function handleMarkAllNotificationsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleSelectNotification(notification: AppNotification) {
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    if (notification.leadId) {
      setSelectedLeadId(notification.leadId);
    } else if (notification.auditSearch) {
      setAuditSearchSeed(notification.auditSearch);
      setView("audit-log");
    }
  }

  function handleToggleNotificationPref(eventKey: string, channel: NotificationChannel, enabled: boolean) {
    setNotifPrefs((prev) => ({ ...prev, [eventKey]: { ...prev[eventKey], [channel]: enabled } }));
    AppToaster.show({
      icon: enabled ? "tick-circle" : "small-cross",
      intent: enabled ? "success" : "none",
      message: `${enabled ? "Enabled" : "Disabled"} ${channel === "inApp" ? "in-app" : "email"} notifications for this event.`,
      timeout: 2000,
    });
  }

  function handleReorderRules(next: AssignmentRule[]) {
    setAssignmentRules(next);
    logAction("Reordered assignment rules", "Assignment Rules", undefined, next.filter((r) => !r.isCatchAll).map((r) => `#${r.priority}`).join(" > "));
  }

  function handleSaveRule(rule: AssignmentRule) {
    const existing = assignmentRules.find((r) => r.id === rule.id);
    const stamped = { ...rule, lastModifiedBy: CURRENT_USER, lastModifiedAt: new Date().toISOString() };
    if (existing) {
      setAssignmentRules((prev) => prev.map((r) => (r.id === rule.id ? stamped : r)));
      logAction("Edited assignment rule", `Rule #${rule.priority}`, summarizeConditions(existing.conditions, existing.conditionLogic), summarizeConditions(rule.conditions, rule.conditionLogic));
    } else {
      setAssignmentRules((prev) => {
        const catchAll = prev.find((r) => r.isCatchAll);
        const rest = prev.filter((r) => !r.isCatchAll);
        return catchAll ? [...rest, stamped, catchAll] : [...rest, stamped];
      });
      logAction("Created assignment rule", `Rule #${rule.priority}`, undefined, `${summarizeConditions(rule.conditions, rule.conditionLogic)} → ${summarizeTarget(rule.assignTarget)}`);
    }
    AppToaster.show({ icon: "tick-circle", intent: "success", message: `Rule #${rule.priority} saved.` });
  }

  function handleDeleteRule(ruleId: string) {
    const rule = assignmentRules.find((r) => r.id === ruleId);
    if (!rule) return;
    setAssignmentRules((prev) => {
      const remaining = prev.filter((r) => r.id !== ruleId);
      const nonCatchAll = remaining.filter((r) => !r.isCatchAll);
      return remaining.map((r) => (r.isCatchAll ? r : { ...r, priority: nonCatchAll.indexOf(r) + 1 }));
    });
    logAction("Deleted assignment rule", `Rule #${rule.priority}`, summarizeConditions(rule.conditions, rule.conditionLogic), "Deleted");
    AppToaster.show({ icon: "trash", intent: "danger", message: `Deleted Rule #${rule.priority}.` });
  }

  function handleDuplicateRule(ruleId: string) {
    const rule = assignmentRules.find((r) => r.id === ruleId);
    if (!rule) return;
    setAssignmentRules((prev) => {
      const catchAll = prev.find((r) => r.isCatchAll);
      const rest = prev.filter((r) => !r.isCatchAll);
      const copy: AssignmentRule = {
        ...rule,
        id: `rule-${Date.now()}`,
        priority: rest.length + 1,
        lastModifiedBy: CURRENT_USER,
        lastModifiedAt: new Date().toISOString(),
      };
      const next = [...rest, copy];
      return catchAll ? [...next, catchAll] : next;
    });
    logAction("Duplicated assignment rule", `Rule #${rule.priority}`);
  }

  function handleToggleRuleStatus(ruleId: string) {
    const rule = assignmentRules.find((r) => r.id === ruleId);
    if (!rule) return;
    const nextStatus = rule.status === "active" ? "inactive" : "active";
    setAssignmentRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, status: nextStatus } : r)));
    logAction(nextStatus === "active" ? "Activated assignment rule" : "Deactivated assignment rule", `Rule #${rule.priority}`, rule.status, nextStatus);
  }

  function handleAddScoringRule() {
    const rule: ScoringRule = { id: `sr-${Date.now()}`, description: "New rule", points: 10, status: "active" };
    setScoringRules((prev) => [...prev, rule]);
    logAction("Added scoring rule", rule.description, undefined, `${rule.points >= 0 ? "+" : ""}${rule.points} pts`);
  }

  function handleSaveScoringRule(rule: ScoringRule) {
    const existing = scoringRules.find((r) => r.id === rule.id);
    setScoringRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
    logAction(
      "Edited scoring rule",
      rule.description,
      existing ? `${existing.description} (${existing.points >= 0 ? "+" : ""}${existing.points})` : undefined,
      `${rule.description} (${rule.points >= 0 ? "+" : ""}${rule.points})`,
    );
  }

  function handleDeleteScoringRule(ruleId: string) {
    const rule = scoringRules.find((r) => r.id === ruleId);
    if (!rule) return;
    setScoringRules((prev) => prev.filter((r) => r.id !== ruleId));
    logAction("Deleted scoring rule", rule.description, `${rule.points >= 0 ? "+" : ""}${rule.points} pts`, "Deleted");
  }

  function handleToggleScoringRuleStatus(ruleId: string) {
    const rule = scoringRules.find((r) => r.id === ruleId);
    if (!rule) return;
    const nextStatus = rule.status === "active" ? "inactive" : "active";
    setScoringRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, status: nextStatus } : r)));
    logAction("Toggled scoring rule", rule.description, rule.status, nextStatus);
  }

  function handleCommitThresholds(next: TierThresholds) {
    const before = `Hot ≥ ${tierThresholds.hotMin}, Warm ≥ ${tierThresholds.warmMin}`;
    const after = `Hot ≥ ${next.hotMin}, Warm ≥ ${next.warmMin}`;
    const retiered = leads.filter((l) => scoreToPriority(l.score, next) !== l.priority).length;
    setTierThresholds(next);
    setLeads((prev) => prev.map((l) => ({ ...l, priority: scoreToPriority(l.score, next) })));
    logAction("Changed threshold", "Prioritization model", before, after);
    AppToaster.show({
      icon: "tick-circle",
      intent: "success",
      message:
        retiered === 0
          ? "Thresholds saved. No lead changed tier."
          : `Thresholds saved — ${retiered} lead${retiered === 1 ? "" : "s"} moved tier. The Attention Center, SLA windows and routing now use the new cut-offs.`,
    });
  }

  function handleReconnect(connectionId: string) {
    setReconnectingId(connectionId);
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) => (c.id === connectionId ? { ...c, status: "healthy", lastSyncAt: new Date().toISOString(), pendingCount: 0 } : c)),
      );
      setReconnectingId(null);
      const conn = connections.find((c) => c.id === connectionId);
      logAction("Reconnected integration", conn?.name ?? connectionId, "Disconnected", "Healthy");
      AppToaster.show({ icon: "tick-circle", intent: "success", message: `${conn?.name ?? "Connection"} reconnected.` });
    }, 1400);
  }

  function handleResolveConflict(connectionId: string, conflictId: string, resolution: ConflictResolution) {
    const conn = connections.find((c) => c.id === connectionId);
    const conflict = conn?.conflicts.find((c) => c.id === conflictId);
    if (!conn || !conflict) return;

    setConnections((prev) =>
      prev.map((c) => {
        if (c.id !== connectionId) return c;
        const remainingConflicts = c.conflicts.filter((cf) => cf.id !== conflictId);
        const pendingCount = Math.max(0, c.pendingCount - 1);
        return {
          ...c,
          conflicts: remainingConflicts,
          pendingCount,
          status: pendingCount === 0 && remainingConflicts.length === 0 ? "healthy" : c.status,
        };
      }),
    );

    const resolutionLabel = resolution === "keep_crm" ? "Kept CRM value" : resolution === "keep_tantira" ? "Kept Tantira value" : "Merged";
    logAction("Resolved sync conflict", `${conn.name} — ${conflict.leadName} (${conflict.field})`, undefined, resolutionLabel);

    const affected = leads.find((l) => l.id === conflict.leadId);
    if (affected && affected.writebackState !== "synced") {
      setLeads((prev) => prev.map((l) => (l.id === affected.id ? { ...l, writebackState: "syncing" } : l)));
      runWriteback(affected.id);
    }
    AppToaster.show({
      icon: "tick-circle",
      intent: "success",
      message: `Resolved ${conflict.field} conflict for ${conflict.leadName}. Writeback resumed — the lead clears from the Attention Center once it syncs.`,
    });
  }

  function handleResolveAmbiguous(leadId: string, resolution: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    if (resolution === "new") {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, accountMatch: "new", candidateAccounts: [] } : l)));
      logAction("Resolved ambiguous match", lead.name, "Ambiguous", "New account");
    } else {
      const score = clampScore(lead.score + 5);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, accountMatch: "matched", candidateAccounts: [], score, priority: scoreToPriority(score, tierThresholds) } : l)),
      );
      logAction("Resolved ambiguous match", lead.name, "Ambiguous", `Matched — ${resolution}`);
    }

    AppToaster.show({ icon: "tick-circle", intent: "success", message: `Continuing automatically…` });
  }

  function handleOpenFullView(leadId: string) {
    setSelectedLeadId(leadId);
    setView("lead-full");
  }

  if (!authenticated) {
    return <LoginPage ssoAvailable={ssoAvailableForEmail} onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell app-shell--sidebar">
      <div className="app-sidebar">
        <AppSidebar4
          activeView={view}
          activeFilters={{ status: filters.status === "All" ? undefined : filters.status, priority: filters.priority === "All" ? undefined : filters.priority, assignee: filters.assignee === "All" ? undefined : filters.assignee }}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          permissions={currentUserPermissions}
        />
      </div>

      <div className="app-content">
        <AppHeader
          notifications={notifications}
          leads={leads}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onSelectNotification={handleSelectNotification}
        />

      {view === "dashboard" && (
        <main className="app-main">
          <PageHeader
            section="Operate"
            title="All Leads"
            description="Every lead in the pipeline. Filter, open, and assign."
            tabs={<LeadsAreaTabs current="dashboard" onChange={navigateTo} />}
          />

          {!loading && <ActionBanner leads={leads} />}

          <KpiRow summary={summary} />

          <FiltersBar
            filters={filters}
            assigneeOptions={ASSIGNEES}
            resultCount={filteredLeads.length}
            totalCount={leads.length}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_FILTERS)}
          />

          {checkedLeadIds.size > 0 && (
            <BulkActionBar count={checkedLeadIds.size} assigneeOptions={ASSIGNEES} onAction={handleBulkAction} onClear={() => setCheckedLeadIds(new Set())} />
          )}

          <LeadsTable
            leads={filteredLeads}
            loading={loading}
            selectedId={selectedLeadId}
            checkedIds={checkedLeadIds}
            onOpenLead={(leadId) => setSelectedLeadId(leadId)}
            onToggleChecked={(leadId) =>
              setCheckedLeadIds((prev) => {
                const next = new Set(prev);
                if (next.has(leadId)) next.delete(leadId);
                else next.add(leadId);
                return next;
              })
            }
            onToggleAll={(leadIds, checked) =>
              setCheckedLeadIds((prev) => {
                const next = new Set(prev);
                leadIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
                return next;
              })
            }
            onClearFilters={() => setFilters(EMPTY_FILTERS)}
          />
        </main>
      )}

      {view === "command-center" && (
        <main className="app-main">
          <CommandCenterPage leads={leads} connections={connections} autoProcessedLog={autoProcessedLog} onNavigate={navigateTo} />
        </main>
      )}

      {view === "needs-attention" && (
        <main className="app-main">
          <NeedsAttentionPage
            leads={leads}
            processedThisWeek={processedThisWeek}
            intakeUnresolved={intakeItems.length}
            onOpenLead={(leadId) => setSelectedLeadId(leadId)}
            onNavigate={navigateTo}
            onRetrySync={handleRetrySync}
            onLeadAction={handleLeadAction}
          />
        </main>
      )}

      {view === "intake" && (
        <main className="app-main">
          <IntakePage sources={INITIAL_INTAKE_SOURCES} items={intakeItems} onResolve={handleResolveIntake} onOpenLead={(leadId) => setSelectedLeadId(leadId)} />
        </main>
      )}

      {view === "performance" && (
        <main className="app-main">
          <PerformancePage
            leads={leads}
            onNavigate={navigateTo}
            onViewRep={(rep) => {
              setViewingAsRep(rep);
              navigateTo("my-leads");
            }}
          />
        </main>
      )}

      {view === "my-leads" && (
        <main className="app-main">
          <MyLeadsPage
            leads={leads}
            reps={ASSIGNEES}
            viewingAs={viewingAsRep}
            onChangeViewingAs={setViewingAsRep}
            onOpenLead={(leadId) => setSelectedLeadId(leadId)}
            onLeadAction={handleLeadAction}
          />
        </main>
      )}

      {view === "workflow" && (
        <main className="app-main">
          <WorkflowPage
            leads={leads}
            nodes={workflowNodes}
            onNodesChange={setWorkflowNodes}
            published={publishedWorkflow}
            versions={workflowVersions}
            onPublish={handlePublishWorkflow}
            onRollback={handleRollbackWorkflow}
            onLogAction={logAction}
            onNavigate={navigateTo}
          />
        </main>
      )}

      {view === "assignment" && (
        <main className="app-main">
          <AssignmentPage
            leads={leads}
            assigneeOptions={ASSIGNEES}
            onOpenLead={(leadId) => setSelectedLeadId(leadId)}
            onAssign={handleAssign}
            onAutoAssign={handleAutoAssignUnassigned}
          />
        </main>
      )}

      {view === "connections" && (
        <main className="app-main">
          <ConnectionsPage
            connections={connections}
            reconnectingId={reconnectingId}
            onReconnect={handleReconnect}
            onOpenLead={(leadId) => setSelectedLeadId(leadId)}
            onResolveConflict={handleResolveConflict}
          />
        </main>
      )}

      {view === "pipeline" && (
        <main className="app-main">
          <PipelineHealthPage leads={leads} autoProcessedLog={autoProcessedLog} onNavigate={navigateTo} />
        </main>
      )}

      {view === "auto-processed-log" && (
        <main className="app-main">
          <AutoProcessedLogPage entries={autoProcessedLog} onOpenLead={handleOpenLeadFromLog} onNavigate={navigateTo} initialSearch={autoLogSearchSeed} />
        </main>
      )}

      {view === "team-members" && (
        <main className="app-main">
          <TeamMembersPage
            members={members}
            roles={roles}
            onInvite={handleInviteMember}
            onChangeRole={handleChangeRole}
            onResend={handleResendInvite}
            onRevoke={handleRevokeInvite}
          />
        </main>
      )}

      {view === "audit-log" && (
        <main className="app-main">
          <AuditLogPage entries={auditLog} initialSearch={auditSearchSeed} />
        </main>
      )}

      {view === "approvals" && (
        <main className="app-main">
          <ApprovalsPage
            leads={leads}
            acknowledgedIds={acknowledgedOverrideIds}
            onAcknowledge={handleAcknowledgeOverride}
            onOpenLead={(leadId) => setSelectedLeadId(leadId)}
          />
        </main>
      )}

      {view === "roles-permissions" && (
        <main className="app-main">
          <RolesPermissionsPage
            roles={roles}
            matrix={matrix}
            onTogglePermission={handleTogglePermission}
            onCreateRole={handleCreateRole}
            onDeleteRole={handleDeleteRole}
          />
        </main>
      )}

      {view === "sso" && (
        <main className="app-main">
          <SsoPage
            config={ssoConfig}
            onSelectProvider={handleSelectProvider}
            onSaveMetadata={handleSaveSsoMetadata}
            onSaveAttributeMap={handleSaveAttributeMap}
            onTestPass={handleSsoTestPass}
            onEnable={handleEnableSso}
            onDisable={handleDisableSso}
          />
        </main>
      )}

      {view === "api-keys" && (
        <main className="app-main">
          <ApiKeysPage keys={apiKeys} onGenerate={handleGenerateApiKey} onRevoke={handleRevokeApiKey} />
        </main>
      )}

      {view === "notification-preferences" && (
        <main className="app-main">
          <NotificationPreferencesPage matrix={notifPrefs} onToggle={handleToggleNotificationPref} />
        </main>
      )}

      {view === "assignment-rules" && (
        <main className="app-main">
          <AssignmentRulesPage
            rules={assignmentRules}
            leads={leads}
            onAutoAssign={handleAutoAssignUnassigned}
            onReorder={handleReorderRules}
            onSaveRule={handleSaveRule}
            onDeleteRule={handleDeleteRule}
            onDuplicateRule={handleDuplicateRule}
            onToggleStatus={handleToggleRuleStatus}
          />
        </main>
      )}

      {view === "prioritization-model" && (
        <main className="app-main app-main--wide">
          <PrioritizationModelPage
            rules={scoringRules}
            thresholds={tierThresholds}
            leads={leads}
            auditLog={auditLog}
            onAddRule={handleAddScoringRule}
            onSaveRule={handleSaveScoringRule}
            onDeleteRule={handleDeleteScoringRule}
            onToggleRuleStatus={handleToggleScoringRuleStatus}
            onChangeThresholds={setTierThresholds}
            onCommitThresholds={handleCommitThresholds}
          />
        </main>
      )}
      {view === "lead-full" && (
        <main className="app-main">
          <LeadDetailPanel
            lead={selectedLead}
            leads={leads}
            assigneeOptions={ASSIGNEES}
            scoringRules={scoringRules}
            conflict={selectedLeadConflict}
            onClose={() => setSelectedLeadId(null)}
            onAssign={handleAssign}
            onRetrySync={handleRetrySync}
            onLogOutcome={handleLogOutcome}
            onCorrectMatch={handleCorrectMatch}
            onResolveAmbiguous={handleResolveAmbiguous}
            onResolveConflict={handleResolveConflict}
            onOpenFullView={handleOpenFullView} onSuggestedAction={handleSuggestedAction} recommendation={selectedRecommendation} onAcceptRecommendation={handleAcceptRecommendation} onOverrideRecommendation={handleOverrideRecommendation} onLeadAction={handleLeadAction} onLogActivity={handleLogActivity}
            asFullPage
          />
        </main>
      )}
      </div>

      {view !== "lead-full" && (
        <LeadDetailPanel
          lead={selectedLead}
          leads={leads}
          assigneeOptions={ASSIGNEES}
          scoringRules={scoringRules}
          conflict={selectedLeadConflict}
          onClose={() => setSelectedLeadId(null)}
          onAssign={handleAssign}
          onRetrySync={handleRetrySync}
          onLogOutcome={handleLogOutcome}
          onCorrectMatch={handleCorrectMatch}
          onResolveAmbiguous={handleResolveAmbiguous}
          onResolveConflict={handleResolveConflict}
          onOpenFullView={handleOpenFullView} onSuggestedAction={handleSuggestedAction} recommendation={selectedRecommendation} onAcceptRecommendation={handleAcceptRecommendation} onOverrideRecommendation={handleOverrideRecommendation} onLeadAction={handleLeadAction} onLogActivity={handleLogActivity}
        />
      )}
    </div>
  );
}
