import { useState } from "react";
import { Icon } from "@blueprintjs/core";
import type { Lead } from "../types";
import type { AppView } from "../components/app-sidebar-4";
import { runDryRun, type DryRunResult } from "../lib/dryRun";
import { NODE_KINDS, NODE_META, addToBranch, createNode, removeNodeDeep, updateNodeDeep, type NodeKind, type WorkflowNode } from "../lib/workflowNodes";
import { sameNodes, validateWorkflow, type ValidationIssue, type WorkflowVersion } from "../lib/workflowLifecycle";
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

interface WorkflowPageProps {
  leads: Lead[];
  nodes: WorkflowNode[];
  onNodesChange: (next: WorkflowNode[]) => void;
  published: WorkflowVersion;
  versions: WorkflowVersion[];
  onPublish: (nodes: WorkflowNode[]) => void;
  onRollback: () => void;
  onLogAction: (action: string, object: string, before?: string, after?: string) => void;
  onNavigate: (view: AppView) => void;
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
  const branchTaken = dryRunResult ? (status["assign-senior"] === "skip" ? "else" : status["assign-round-robin"] === "skip" ? "then" : undefined) : undefined;
  const activeTool = selectedTool ? NODE_META[selectedTool] : null;
  const dirty = !sameNodes(nodes, published.nodes);
  const previousVersion = versions.filter((v) => v.version < published.version).sort((a, b) => b.version - a.version)[0] ?? null;

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

        <TriggerBlock name="New Lead Captured" eventLabel="Lead object created" source="Lead" dryRunStatus={status["trigger"]} dryRunDetail={detail("trigger")} />
        <Connector />

        <ActionBlock
          name="Enrich Lead Data"
          actionIcon="new-object"
          actionLabel="Enrich Lead (Clearbit + firmographics)"
          outputLabel="Output"
          fields={[
            { label: "Lead", value: "Trigger.Lead", required: true },
            { label: "Enrichment Source", value: "Clearbit API" },
          ]}
          dryRunStatus={status["enrich"]}
          dryRunDetail={detail("enrich")}
        />
        <Connector />

        <ActionBlock
          name="Compute Lead Score"
          actionIcon="calculator"
          actionLabel="Score Lead (rules + firmographic weight)"
          outputLabel="Output"
          fields={[
            { label: "Lead", value: "Enrich Lead Data.Output", required: true },
            { label: "Prioritization Model", value: "v3 — Firmographic + Engagement" },
          ]}
          dryRunStatus={status["score"]}
          dryRunDetail={detail("score")}
          configLink={{ label: "Scoring rules & tier thresholds — Prioritization Model", onClick: () => onNavigate("prioritization-model") }}
        />
        <Connector />

        <ConditionalBlock
          name="Route by Priority"
          condition={{ left: "Compute Lead Score.score", operator: "≥", right: "75" }}
          thenLabel="High priority"
          elseLabel="Standard priority"
          dryRunStatus={status["route"]}
          dryRunDetail={detail("route")}
          branchTaken={branchTaken}
          thenChildren={
            <ActionBlock
              nested
              name="Assign to Senior Rep"
              actionIcon="star"
              actionLabel="Assign Lead (senior pool, fast SLA)"
              fields={[
                { label: "Lead", value: "Compute Lead Score.Output", required: true },
                { label: "Assignee Pool", value: "Senior AEs" },
                { label: "SLA", value: "15 minutes" },
              ]}
              dryRunStatus={status["assign-senior"]}
              dryRunDetail={detail("assign-senior")}
              configLink={{ label: "Who gets what — Assignment Rules", onClick: () => onNavigate("assignment-rules") }}
            />
          }
          elseChildren={
            <ActionBlock
              nested
              name="Assign to Round-Robin Queue"
              actionIcon="people"
              actionLabel="Assign Lead (SDR round-robin)"
              fields={[
                { label: "Lead", value: "Compute Lead Score.Output", required: true },
                { label: "Assignee Pool", value: "SDR Queue" },
                { label: "SLA", value: "4 hours" },
              ]}
              dryRunStatus={status["assign-round-robin"]}
              dryRunDetail={detail("assign-round-robin")}
              configLink={{ label: "Who gets what — Assignment Rules", onClick: () => onNavigate("assignment-rules") }}
            />
          }
        />
        <Connector />

        <LoopBlock name="Notify Stakeholders" elements="assignedReps" elementVar="Rep" indexVar="Index" dryRunStatus={status["notify"]} dryRunDetail={detail("notify")}>
          <ActionBlock
            nested
            name="Send Assignment Notification"
            actionIcon="notifications"
            actionLabel="Notify Rep (Slack DM)"
            fields={[
              { label: "Recipient", value: "Rep", required: true },
              { label: "Channel", value: "Slack DM" },
            ]}
          />
        </LoopBlock>
        <Connector />

        <ActionBlock
          name="Update CRM Status"
          actionIcon="tick-circle"
          actionLabel="Update Lead Status"
          fields={[
            { label: "Lead", value: "Trigger.Lead", required: true },
            { label: "Status", value: "Assigned" },
            { label: "Last Triaged At", value: "now()" },
          ]}
          dryRunStatus={status["update-crm"]}
          dryRunDetail={detail("update-crm")}
          configLink={{ label: "Sync health & conflicts — Connections", onClick: () => onNavigate("connections") }}
        />

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
        onCancel={() => setConfirm(null)}
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
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
