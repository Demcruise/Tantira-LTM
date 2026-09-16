import { useState } from "react";
import { Icon } from "@blueprintjs/core";
import type { Lead } from "../types";
import type { AppView, FilterPreset } from "../types";
import { runDryRun, type DryRunResult } from "../lib/dryRun";
import { NODE_KINDS, NODE_META, addToBranch, createNode, removeNodeDeep, updateNodeDeep, type NodeKind, type WorkflowNode } from "../lib/workflowNodes";
import { getPreviousVersion, sameNodes, validateWorkflow, FIXED_STAGE_IDS, type ValidationIssue, type WorkflowVersion } from "../lib/workflowLifecycle";
import { TriggerBlock } from "../components/workflow/TriggerBlock";
import { ActionBlock } from "../components/workflow/ActionBlock";
import { ConditionalBlock } from "../components/workflow/ConditionalBlock";
import { LoopBlock } from "../components/workflow/LoopBlock";
import { DryRunToggle } from "../components/workflow/DryRunToggle";
import { DryRunBanner } from "../components/workflow/DryRunBanner";
import { DryRunExecutionTrace } from "../components/workflow/DryRunExecutionTrace";
import { WorkflowLifecycleBar } from "../components/workflow/WorkflowLifecycleBar";
import { WorkflowNodeCard } from "../components/workflow/nodes/WorkflowNodeCard";
import { AddBlockMenu } from "../components/workflow/nodes/AddBlockMenu";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PageHeader } from "../components/PageHeader";

function Connector() {
  return <div className="wf-connector" />;
}

type FixedStage =
  | { kind: "trigger"; id: string; name: string; eventLabel: string; source: string }
  | { kind: "action"; id: string; name: string; actionIcon?: import("@blueprintjs/icons").IconName; actionLabel: string; fields: { label: string; value: string; required?: boolean }[]; configLink?: { label: string; onClick: () => void } }
  | { kind: "conditional"; id: string; name: string; condition: { left: string; operator: string; right: string }; thenLabel: string; elseLabel: string; thenId: string; elseId: string; thenAction: Omit<Extract<FixedStage, { kind: "action" }>, "kind">; elseAction: Omit<Extract<FixedStage, { kind: "action" }>, "kind"> }
  | { kind: "loop"; id: string; name: string; elements: string; elementVar: string; indexVar: string; child: Omit<Extract<FixedStage, { kind: "action" }>, "kind"> };

interface WorkflowPageProps {
  leads: Lead[];
  nodes: WorkflowNode[];
  onNodesChange: (next: WorkflowNode[]) => void;
  published: WorkflowVersion;
  versions: WorkflowVersion[];
  onPublish: (nodes: WorkflowNode[]) => void;
  onRollback: () => void;
  onLogAction: (action: string, object: string, before?: string, after?: string) => void;
  onNavigate: (view: AppView, filterPreset?: FilterPreset) => void;
}

export function WorkflowPage({ leads, nodes, onNodesChange, published, versions, onPublish, onRollback, onLogAction, onNavigate }: WorkflowPageProps) {
  const [testMode, setTestMode] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [selectedTool, setSelectedTool] = useState<NodeKind | null>(null);
  const [testedSinceChange, setTestedSinceChange] = useState(false);
  const [issues, setIssues] = useState<ValidationIssue[] | null>(null);
  const [confirm, setConfirm] = useState<"publish" | "rollback" | null>(null);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? null;
  const status = dryRunResult?.statusByNode ?? {};
  const detail = (nodeId: string) => dryRunResult?.steps.find((s) => s.nodeId === nodeId)?.detail;
  const branchTaken = dryRunResult ? (status[FIXED_STAGE_IDS.assignSenior] === "skip" ? "else" : status[FIXED_STAGE_IDS.assignRoundRobin] === "skip" ? "then" : undefined) : undefined;
  const activeTool = selectedTool ? NODE_META[selectedTool] : null;
  const dirty = !sameNodes(nodes, published.nodes);
  const previousVersion = getPreviousVersion(versions, published.version);

  const fixedStages: FixedStage[] = [
    { kind: "trigger", id: FIXED_STAGE_IDS.trigger, name: "New Lead Captured", eventLabel: "Lead object created", source: "Lead" },
    {
      kind: "action",
      id: FIXED_STAGE_IDS.enrich,
      name: "Enrich Lead Data",
      actionIcon: "new-object",
      actionLabel: "Enrich Lead (Clearbit + firmographics)",
      fields: [
        { label: "Lead", value: "Trigger.Lead", required: true },
        { label: "Enrichment Source", value: "Clearbit API" },
      ],
    },
    {
      kind: "action",
      id: FIXED_STAGE_IDS.score,
      name: "Compute Lead Score",
      actionIcon: "calculator",
      actionLabel: "Score Lead (rules + firmographic weight)",
      fields: [
        { label: "Lead", value: "Enrich Lead Data.Output", required: true },
        { label: "Prioritization Model", value: "v3 — Firmographic + Engagement" },
      ],
      configLink: { label: "Scoring rules & tier thresholds — Prioritization Model", onClick: () => onNavigate("prioritization-model") },
    },
    {
      kind: "conditional",
      id: FIXED_STAGE_IDS.route,
      name: "Route by Priority",
      condition: { left: "Compute Lead Score.score", operator: "≥", right: "75" },
      thenLabel: "High priority",
      elseLabel: "Standard priority",
      thenId: FIXED_STAGE_IDS.assignSenior,
      elseId: FIXED_STAGE_IDS.assignRoundRobin,
      thenAction: {
        id: FIXED_STAGE_IDS.assignSenior,
        name: "Assign to Senior Rep",
        actionIcon: "star",
        actionLabel: "Assign Lead (senior pool, fast SLA)",
        fields: [
          { label: "Lead", value: "Compute Lead Score.Output", required: true },
          { label: "Assignee Pool", value: "Senior AEs" },
          { label: "SLA", value: "15 minutes" },
        ],
        configLink: { label: "Who gets what — Assignment Rules", onClick: () => onNavigate("assignment-rules") },
      },
      elseAction: {
        id: FIXED_STAGE_IDS.assignRoundRobin,
        name: "Assign to Round-Robin Queue",
        actionIcon: "people",
        actionLabel: "Assign Lead (SDR round-robin)",
        fields: [
          { label: "Lead", value: "Compute Lead Score.Output", required: true },
          { label: "Assignee Pool", value: "SDR Queue" },
          { label: "SLA", value: "4 hours" },
        ],
        configLink: { label: "Who gets what — Assignment Rules", onClick: () => onNavigate("assignment-rules") },
      },
    },
    {
      kind: "loop",
      id: FIXED_STAGE_IDS.notify,
      name: "Notify Stakeholders",
      elements: "assignedReps",
      elementVar: "Rep",
      indexVar: "Index",
      child: {
        id: "notify-send",
        name: "Send Assignment Notification",
        actionIcon: "notifications",
        actionLabel: "Notify Rep (Slack DM)",
        fields: [
          { label: "Recipient", value: "Rep", required: true },
          { label: "Channel", value: "Slack DM" },
        ],
      },
    },
    {
      kind: "action",
      id: FIXED_STAGE_IDS.updateCrm,
      name: "Update CRM Status",
      actionIcon: "tick-circle",
      actionLabel: "Update Lead Status",
      fields: [
        { label: "Lead", value: "Trigger.Lead", required: true },
        { label: "Status", value: "Assigned" },
        { label: "Last Triaged At", value: "now()" },
      ],
      configLink: { label: "Sync health & conflicts — Connections", onClick: () => onNavigate("connections") },
    },
  ];

  function renderFixedStage(stage: FixedStage) {
    switch (stage.kind) {
      case "trigger":
        return <TriggerBlock name={stage.name} eventLabel={stage.eventLabel} source={stage.source} dryRunStatus={status[stage.id]} dryRunDetail={detail(stage.id)} />;
      case "action":
        return (
          <ActionBlock
            name={stage.name}
            actionIcon={stage.actionIcon}
            actionLabel={stage.actionLabel}
            outputLabel="Output"
            fields={stage.fields}
            dryRunStatus={status[stage.id]}
            dryRunDetail={detail(stage.id)}
            configLink={stage.configLink}
          />
        );
      case "conditional":
        return (
          <ConditionalBlock
            name={stage.name}
            condition={stage.condition}
            thenLabel={stage.thenLabel}
            elseLabel={stage.elseLabel}
            dryRunStatus={status[stage.id]}
            dryRunDetail={detail(stage.id)}
            branchTaken={branchTaken}
            thenChildren={
              <ActionBlock
                nested
                name={stage.thenAction.name}
                actionIcon={stage.thenAction.actionIcon}
                actionLabel={stage.thenAction.actionLabel}
                fields={stage.thenAction.fields}
                dryRunStatus={status[stage.thenAction.id]}
                dryRunDetail={detail(stage.thenAction.id)}
                configLink={stage.thenAction.configLink}
              />
            }
            elseChildren={
              <ActionBlock
                nested
                name={stage.elseAction.name}
                actionIcon={stage.elseAction.actionIcon}
                actionLabel={stage.elseAction.actionLabel}
                fields={stage.elseAction.fields}
                dryRunStatus={status[stage.elseAction.id]}
                dryRunDetail={detail(stage.elseAction.id)}
                configLink={stage.elseAction.configLink}
              />
            }
          />
        );
      case "loop":
        return (
          <LoopBlock name={stage.name} elements={stage.elements} elementVar={stage.elementVar} indexVar={stage.indexVar} dryRunStatus={status[stage.id]} dryRunDetail={detail(stage.id)}>
            <ActionBlock
              nested
              name={stage.child.name}
              actionIcon={stage.child.actionIcon}
              actionLabel={stage.child.actionLabel}
              fields={stage.child.fields}
            />
          </LoopBlock>
        );
      default: {
        const _exhaustive: never = stage;
        throw new Error(`Unknown fixed stage kind: ${_exhaustive}`);
      }
    }
  }

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const runsThisWeek = leads.filter((l) => new Date(l.createdAt).getTime() >= weekAgo).length;
  const errorsThisWeek = leads.filter((l) => l.writebackState === "failed").length;
  const lastRunAt = leads.map((l) => l.createdAt).sort().pop() ?? null;

  function changeNodes(next: WorkflowNode[]) {
    onNodesChange(next);
    setDryRunResult(null);
    setTestedSinceChange(false);
    setIssues(null);
  }

  function handleRun() {
    if (!selectedLead) return;
    setDryRunResult(runDryRun(selectedLead, nodes));
    setTestedSinceChange(true);
  }

  function handleAddNode(kind: NodeKind) {
    changeNodes([...nodes, createNode(kind)]);
    setSelectedTool(kind);
    onLogAction("Added workflow step", `Workflow draft — ${NODE_META[kind].label}`);
  }

  function handleAddToBranch(conditionId: string, branch: "then" | "else", kind: NodeKind) {
    changeNodes(addToBranch(nodes, conditionId, branch, createNode(kind)));
    onLogAction("Added workflow step", `Workflow draft — ${NODE_META[kind].label} (${branch} branch)`);
  }

  function handleRemoveNode(nodeId: string) {
    changeNodes(removeNodeDeep(nodes, nodeId));
    onLogAction("Removed workflow step", "Workflow draft");
  }

  function handleMoveNode(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= nodes.length) return;
    const next = [...nodes];
    [next[index], next[target]] = [next[target], next[index]];
    changeNodes(next);
  }

  function handleValidate() {
    setIssues(validateWorkflow(nodes));
  }

  return (
    <div className="workflow-page">
      <PageHeader
        section="Automate"
        title="Lead Triage Workflow"
        description="Runs on every captured lead: Enrich → Prioritize → Route & Assign → Notify → Write back to CRM. Edit the draft, test it against a real lead, validate, then publish a new version — the live version keeps running untouched until you do."
      />

      <WorkflowLifecycleBar
        published={published}
        previousVersion={previousVersion}
        dirty={dirty}
        testedSinceChange={testedSinceChange}
        issues={issues}
        runsThisWeek={runsThisWeek}
        errorsThisWeek={errorsThisWeek}
        lastRunAt={lastRunAt}
        onValidate={handleValidate}
        onPublish={() => setConfirm("publish")}
        onRollback={() => setConfirm("rollback")}
        onDiscard={() => changeNodes(published.nodes)}
      />

      <div className="wf-canvas">
        <div className="wf-toolbar">
          <div className="wf-toolbar__items">
            {NODE_KINDS.map((kind) => {
              const meta = NODE_META[kind];
              return (
                <button
                  key={kind}
                  type="button"
                  className={`wf-toolbar__item${selectedTool === kind ? " wf-toolbar__item--active" : ""}`}
                  onClick={() => handleAddNode(kind)}
                  title={`Add ${meta.label} to the canvas`}
                >
                  <Icon icon={meta.icon} size={13} />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
          <div className="wf-dryrun-toolbar">
            <DryRunToggle testMode={testMode} onToggle={setTestMode} />
          </div>
        </div>

        {activeTool ? (
          <div className="wf-block-info">
            <div className="wf-block-info__header">
              <Icon icon={activeTool.icon} size={14} />
              <span className="wf-block-info__title">{activeTool.label}</span>
              <span className="wf-block-info__added">Added to the end of the canvas</span>
              <button type="button" className="wf-block-info__close" onClick={() => setSelectedTool(null)}>
                <Icon icon="cross" size={12} />
              </button>
            </div>
            <p className="wf-block-info__description">{activeTool.description}</p>
            <p className="wf-block-info__example">{activeTool.example}</p>
          </div>
        ) : (
          <div className="wf-block-info wf-block-info--empty">
            <Icon icon="info-sign" size={13} />
            <span>Click a block type above to add it to the draft. Condition blocks open Then / Else branches you can build into.</span>
          </div>
        )}

        {testMode && (
          <DryRunBanner
            leads={leads}
            selectedLeadId={selectedLeadId}
            onSelectLead={(leadId) => {
              setSelectedLeadId(leadId);
              setDryRunResult(null);
            }}
            onRun={handleRun}
            canRun={selectedLead !== null}
          />
        )}

        {fixedStages.map((stage, i) => (
          <div key={stage.id}>
            {i > 0 && <Connector />}
            {renderFixedStage(stage)}
          </div>
        ))}

        {nodes.map((node, index) => (
          <div key={node.id}>
            <Connector />
            <WorkflowNodeCard
              node={node}
              rootNodes={nodes}
              statusByNode={status}
              detailFor={detail}
              onChange={(next) => changeNodes(updateNodeDeep(nodes, next.id, next))}
              onRemove={handleRemoveNode}
              onAddToBranch={handleAddToBranch}
              onMoveUp={index > 0 ? () => handleMoveNode(index, -1) : undefined}
              onMoveDown={index < nodes.length - 1 ? () => handleMoveNode(index, 1) : undefined}
            />
          </div>
        ))}

        <div className="wf-add-block-row">
          <AddBlockMenu onAdd={handleAddNode} small={false} />
        </div>

        {dryRunResult && selectedLead && <DryRunExecutionTrace steps={dryRunResult.steps} leadName={selectedLead.name} />}
      </div>

      <ConfirmDialog
        isOpen={confirm === "publish"}
        title={`Publish v${published.version + 1}?`}
        description="The new version starts running on every lead captured from now on. Leads already in flight finish on the current version. You can roll back at any time."
        confirmText={`Publish v${published.version + 1}`}
        onConfirm={() => {
          onPublish(nodes);
          setConfirm(null);
          setIssues(null);
          setTestedSinceChange(false);
        }}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        isOpen={confirm === "rollback"}
        title={previousVersion ? `Roll back to v${previousVersion.version}?` : "Roll back"}
        description="The previous version becomes live again immediately and your current draft is replaced with it. The rolled-back version stays in history."
        confirmText="Roll back"
        onConfirm={() => {
          onRollback();
          setConfirm(null);
          setIssues(null);
          setTestedSinceChange(false);
        }}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
