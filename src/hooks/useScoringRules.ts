import { useState } from "react";
import { INITIAL_SCORING_RULES, INITIAL_TIER_THRESHOLDS } from "../data/scoringRules";
import { scoreToPriority } from "../lib/scoring";
import type { Lead, ScoringRule, TierThresholds } from "../types";
import { AppToaster } from "../lib/toaster";

type LogAction = (action: string, object: string, before?: string, after?: string) => void;
type SetLeads = (updater: (prev: Lead[]) => Lead[]) => void;

/** Owns scoring rules + tier thresholds and their edit/commit handlers for the Prioritization Model page. */
export function useScoringRules(logAction: LogAction, leads: Lead[], setLeads: SetLeads) {
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>(INITIAL_SCORING_RULES);
  const [tierThresholds, setTierThresholds] = useState<TierThresholds>(INITIAL_TIER_THRESHOLDS);

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

  return {
    scoringRules,
    tierThresholds,
    setTierThresholds,
    handleAddScoringRule,
    handleSaveScoringRule,
    handleDeleteScoringRule,
    handleToggleScoringRuleStatus,
    handleCommitThresholds,
  };
}
