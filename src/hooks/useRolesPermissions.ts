import { useState } from "react";
import { INITIAL_MATRIX, INITIAL_ROLES, PERMISSIONS, type PermissionKey, type PermissionMatrix, type RoleDef } from "../data/permissions";
import { AppToaster } from "../lib/toaster";

type LogAction = (action: string, object: string, before?: string, after?: string) => void;

/** Owns roles + the permission matrix and their toggle/create/delete handlers for the Roles & Permissions page. */
export function useRolesPermissions(logAction: LogAction) {
  const [roles, setRoles] = useState<RoleDef[]>(INITIAL_ROLES);
  const [matrix, setMatrix] = useState<PermissionMatrix>(INITIAL_MATRIX);

  function handleTogglePermission(roleId: string, permKey: PermissionKey, granted: boolean) {
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
      [id]: Object.fromEntries(PERMISSIONS.map((p) => [p.key, false])) as Record<PermissionKey, boolean>,
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

  return { roles, matrix, handleTogglePermission, handleCreateRole, handleDeleteRole };
}
