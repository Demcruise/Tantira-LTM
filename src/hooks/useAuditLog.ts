import { useState } from "react";
import { createAuditEntry, SEED_AUDIT_LOG } from "../lib/auditLog";
import { CURRENT_USER } from "../data/team";
import type { AuditLogEntry } from "../types";

/** Owns the audit log and the `logAction` helper every other domain hook uses to record changes. */
export function useAuditLog() {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(SEED_AUDIT_LOG);

  function logAction(action: string, object: string, before?: string, after?: string) {
    setAuditLog((prev) => [
      createAuditEntry({ actor: { type: "user", name: CURRENT_USER }, action, object, before, after }),
      ...prev,
    ]);
  }

  return { auditLog, logAction };
}
