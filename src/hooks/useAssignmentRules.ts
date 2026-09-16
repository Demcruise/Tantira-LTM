import { useState } from "react";
import { INITIAL_ASSIGNMENT_RULES } from "../data/assignmentRules";
import { CURRENT_USER } from "../data/team";
import { summarizeConditions, summarizeTarget } from "../lib/ruleEngine";
import type { AssignmentRule } from "../types";
import { AppToaster } from "../lib/toaster";

type LogAction = (action: string, object: string, before?: string, after?: string) => void;

/** Owns assignment rules and their reorder/save/delete/duplicate/toggle handlers for the Assignment Rules page. */
export function useAssignmentRules(logAction: LogAction) {
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>(INITIAL_ASSIGNMENT_RULES);

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

  return {
    assignmentRules,
    handleReorderRules,
    handleSaveRule,
    handleDeleteRule,
    handleDuplicateRule,
    handleToggleRuleStatus,
  };
}
