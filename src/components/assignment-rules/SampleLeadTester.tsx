import { useMemo, useState } from "react";
import type { AssignmentRule, SampleLeadInput } from "../../types";
import { findMatchingRule } from "../../lib/ruleEngine";
import { SampleLeadForm } from "./SampleLeadForm";
import { MatchResultPreview } from "./MatchResultPreview";

const DEFAULT_SAMPLE: SampleLeadInput = {
  score: 75,
  priority: "Hot",
  source: "Website Form",
  status: "New",
  company: "Acme Corp",
};

export function SampleLeadTester({ rules }: { rules: AssignmentRule[] }) {
  const [sample, setSample] = useState<SampleLeadInput>(DEFAULT_SAMPLE);
  const matchedRule = useMemo(() => findMatchingRule(sample, rules), [sample, rules]);

  return (
    <div className="sample-lead-tester">
      <SampleLeadForm value={sample} onChange={setSample} />
      <MatchResultPreview matchedRule={matchedRule} />
    </div>
  );
}
