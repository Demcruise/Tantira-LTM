import type { ReactNode } from "react";

interface NodeFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function NodeField({ label, required, hint, children }: NodeFieldProps) {
  return (
    <div className="wf-action__field">
      <div className="wf-action__field-label">
        {label}
        {required && <span className="wf-required">*</span>}
      </div>
      {children}
      {hint && <div className="wf-node-hint">{hint}</div>}
    </div>
  );
}
