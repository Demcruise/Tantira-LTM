import { HTMLSelect, InputGroup } from "@blueprintjs/core";
import type { SampleLeadInput } from "../../types";

interface SampleLeadFormProps {
  value: SampleLeadInput;
  onChange: (value: SampleLeadInput) => void;
}

export function SampleLeadForm({ value, onChange }: SampleLeadFormProps) {
  return (
    <div className="sample-lead-form">
      <div className="sample-lead-form__row">
        <span>Prioritization Score</span>
        <InputGroup
          type="number"
          value={String(value.score)}
          onChange={(e) => onChange({ ...value, score: Number(e.target.value) })}
        />
      </div>
      <div className="sample-lead-form__row">
        <span>Priority</span>
        <HTMLSelect value={value.priority} onChange={(e) => onChange({ ...value, priority: e.target.value as SampleLeadInput["priority"] })}>
          <option value="Hot">Hot</option>
          <option value="Warm">Warm</option>
          <option value="Cold">Cold</option>
        </HTMLSelect>
      </div>
      <div className="sample-lead-form__row">
        <span>Source</span>
        <InputGroup value={value.source} onChange={(e) => onChange({ ...value, source: e.target.value })} />
      </div>
      <div className="sample-lead-form__row">
        <span>Status</span>
        <HTMLSelect value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as SampleLeadInput["status"] })}>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Assigned">Assigned</option>
          <option value="Lost">Lost</option>
        </HTMLSelect>
      </div>
      <div className="sample-lead-form__row">
        <span>Company</span>
        <InputGroup value={value.company} onChange={(e) => onChange({ ...value, company: e.target.value })} />
      </div>
    </div>
  );
}
