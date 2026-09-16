export interface PermissionDef {
  key: string;
  module: string;
  label: string;
}

export interface RoleDef {
  id: string;
  name: string;
  system: boolean;
  scope: string | null; // null = workspace-wide; otherwise a territory name (see ALL_TERRITORIES) the role is restricted to
}

export const PERMISSIONS = [
  { key: "leads.view", module: "Leads", label: "View" },
  { key: "leads.assign", module: "Leads", label: "Assign" },
  { key: "leads.delete", module: "Leads", label: "Delete" },
  { key: "automation.view", module: "Automation", label: "View" },
  { key: "automation.edit", module: "Automation", label: "Edit" },
  { key: "audit.view", module: "Audit Log", label: "View" },
  { key: "analytics.view", module: "Analytics", label: "View" },
  { key: "org.manage", module: "Organization", label: "Manage" },
] as const satisfies readonly PermissionDef[];

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

// roleId -> permKey -> granted. roleId stays a string since roles can be created
// dynamically (see handleCreateRole); permKey is closed to the known PERMISSIONS set.
export type PermissionMatrix = Record<string, Record<PermissionKey, boolean>>;

export const PERMISSION_MODULES = Array.from(new Set(PERMISSIONS.map((p) => p.module)));

export function resolveRoleId(roles: RoleDef[], roleName: string): string | undefined {
  return roles.find((r) => r.name === roleName)?.id;
}

export function hasPermission(matrix: PermissionMatrix, roleId: string | undefined, permKey: PermissionKey): boolean {
  if (!roleId) return false;
  return matrix[roleId]?.[permKey] ?? false;
}

export const INITIAL_ROLES: RoleDef[] = [
  { id: "admin", name: "Admin", system: true, scope: null },
  { id: "sales-ops", name: "Sales Ops", system: true, scope: null },
  { id: "rep", name: "Rep", system: true, scope: null },
  { id: "reporter", name: "Reporter", system: false, scope: null },
];

export const INITIAL_MATRIX: PermissionMatrix = {
  admin: {
    "leads.view": true,
    "leads.assign": true,
    "leads.delete": true,
    "automation.view": true,
    "automation.edit": true,
    "audit.view": true,
    "analytics.view": true,
    "org.manage": true,
  },
  "sales-ops": {
    "leads.view": true,
    "leads.assign": true,
    "leads.delete": false,
    "automation.view": true,
    "automation.edit": true,
    "audit.view": true,
    "analytics.view": true,
    "org.manage": true,
  },
  rep: {
    "leads.view": true,
    "leads.assign": false,
    "leads.delete": false,
    "automation.view": false,
    "automation.edit": false,
    "audit.view": false,
    "analytics.view": false,
    "org.manage": false,
  },
  reporter: {
    "leads.view": true,
    "leads.assign": false,
    "leads.delete": false,
    "automation.view": false,
    "automation.edit": false,
    "audit.view": true,
    "analytics.view": true,
    "org.manage": false,
  },
};
