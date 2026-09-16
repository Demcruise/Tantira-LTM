import { useRef, useState } from "react";
import { Button, Card, Dialog, Classes } from "@blueprintjs/core";
import type { AssignmentRule, Lead } from "../types";
import { findMatchingRule, leadToSample } from "../lib/ruleEngine";
import { PageHeader } from "../components/PageHeader";
import { RuleRow } from "../components/assignment-rules/RuleRow";
import { CatchAllRuleCard } from "../components/assignment-rules/CatchAllRuleCard";
import { RuleEditorDrawer } from "../components/assignment-rules/RuleEditorDrawer";
import { SampleLeadTester } from "../components/assignment-rules/SampleLeadTester";
import { ConfirmDialog } from "../components/ConfirmDialog";

interface AssignmentRulesPageProps {
  rules: AssignmentRule[];
  leads: Lead[];
  onAutoAssign: () => void;
  onReorder: (rules: AssignmentRule[]) => void;
  onSaveRule: (rule: AssignmentRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onDuplicateRule: (ruleId: string) => void;
  onToggleStatus: (ruleId: string) => void;
}

export function AssignmentRulesPage({ rules, leads, onAutoAssign, onReorder, onSaveRule, onDeleteRule, onDuplicateRule, onToggleStatus }: AssignmentRulesPageProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AssignmentRule | null>(null);
  const [testerOpen, setTesterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AssignmentRule | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<AssignmentRule | null>(null);

  const dragIndex = useRef<number | null>(null);

  const nonCatchAll = rules.filter((r) => !r.isCatchAll).sort((a, b) => a.priority - b.priority);
  const catchAll = rules.find((r) => r.isCatchAll);
  const activeSpecificCount = nonCatchAll.filter((r) => r.status === "active").length;

  const openLeads = leads.filter((l) => l.status !== "Lost");
  const unassignedCount = openLeads.filter((l) => l.assignedTo === null).length;
  const matchCounts = new Map<string, number>();
  for (const lead of openLeads) {
    const match = findMatchingRule(leadToSample(lead), rules);
    if (match) matchCounts.set(match.id, (matchCounts.get(match.id) ?? 0) + 1);
  }

  function openNew() {
    setEditingRule(null);
    setEditorOpen(true);
  }

  function openEdit(rule: AssignmentRule) {
    setEditingRule(rule);
    setEditorOpen(true);
  }

  function handleSave(rule: AssignmentRule) {
    onSaveRule(rule);
    setEditorOpen(false);
  }

  function handleToggle(rule: AssignmentRule) {
    const wouldBeLastActive = rule.status === "active" && activeSpecificCount === 1;
    if (wouldBeLastActive) {
      setDeactivateTarget(rule);
    } else {
      onToggleStatus(rule.id);
    }
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === index) return;
    const reordered = [...nonCatchAll];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(index, 0, moved);
    const withPriorities = reordered.map((r, i) => ({ ...r, priority: i + 1 }));
    onReorder(catchAll ? [...withPriorities, catchAll] : withPriorities);
  }

  return (
    <div className="assignment-rules-page">
      <PageHeader
        section="Optimize"
        title="Assignment Rules"
        description="Ordered rules that decide who gets each lead. First match wins; the catch-all takes the rest. New leads are assigned automatically on capture; use “Apply to unassigned” to run the chain over leads already waiting in the pool."
        actions={
          <>
            <Button icon="lab-test" text="Test with sample lead" onClick={() => setTesterOpen(true)} />
            <Button icon="flash" text={`Apply to ${unassignedCount} unassigned`} disabled={unassignedCount === 0} onClick={onAutoAssign} />
            <Button intent="primary" icon="add" text="New rule" onClick={openNew} />
          </>
        }
      />

      <Card className="page-card">
      <div className="rule-list">
        {nonCatchAll.map((rule, i) => (
          <RuleRow
            key={rule.id}
            rule={rule}
            matchCount={matchCounts.get(rule.id) ?? 0}
            onEdit={() => openEdit(rule)}
            onDuplicate={() => onDuplicateRule(rule.id)}
            onDelete={() => setDeleteTarget(rule)}
            onToggleStatus={() => handleToggle(rule)}
            dragHandlers={{
              draggable: true,
              onDragStart: () => handleDragStart(i),
              onDragOver: (e) => e.preventDefault(),
              onDrop: () => handleDrop(i),
            }}
          />
        ))}
      </div>

      {catchAll && <CatchAllRuleCard rule={catchAll} onEdit={() => openEdit(catchAll)} />}
      </Card>

      <RuleEditorDrawer isOpen={editorOpen} rule={editingRule} rules={rules} onSave={handleSave} onClose={() => setEditorOpen(false)} />

      <Dialog isOpen={testerOpen} onClose={() => setTesterOpen(false)} title="Test with sample lead" icon="lab-test">
        <div className={Classes.DIALOG_BODY}>
          <SampleLeadTester rules={rules} />
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete rule"
        description={`Delete Rule #${deleteTarget?.priority}? Leads that would have matched it will fall through to the next rule.`}
        confirmText="Delete rule"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDeleteRule(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        isOpen={deactivateTarget !== null}
        title="Deactivate last active rule"
        description="This is the only active rule besides the catch-all. Deactivating it means every lead will fall through to the catch-all rule."
        confirmText="Deactivate anyway"
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => {
          if (deactivateTarget) onToggleStatus(deactivateTarget.id);
          setDeactivateTarget(null);
        }}
      />
    </div>
  );
}
