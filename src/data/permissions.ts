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

export type PermissionMatrix = Record<string, Record<string, boolean>>; // roleId -> permKey -> granted

export const PERMISSIONS: PermissionDef[] = [
  { key: "leads.view", module: "Leads", label: "View" },
  { key: "leads.assign", module: "Leads", label: "Assign" },
  { key: "leads.delete", module: "Leads", label: "Delete" },
  { key: "automation.view", module: "Automation", label: "View" },
  { key: "automation.edit", module: "Automation", label: "Edit" },
  { key: "billing.view", module: "Billing", label: "View" },
  { key: "audit.view", module: "Audit Log", label: "View" },
  { key: "analytics.view", module: "Analytics", label: "View" },
];

export const PERMISSION_MODULES = Array.from(new Set(PERMISSIONS.map((p) => p.module)));

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
    "billing.view": true,
    "audit.view": true,
    "analytics.view": true,
  },
  "sales-ops": {
    "leads.view": true,
    "leads.assign": true,
    "leads.delete": false,
    "automation.view": true,
    "automation.edit": true,
    "billing.view": false,
    "audit.view": true,
    "analytics.view": true,
  },
  rep: {
    "leads.view": true,
    "leads.assign": false,
    "leads.delete": false,
    "automation.view": false,
    "automation.edit": false,
    "billing.view": false,
    "audit.view": false,
    "analytics.view": false,
  },
  reporter: {
    "leads.view": true,
    "leads.assign": false,
    "leads.delete": false,
    "automation.view": false,
    "automation.edit": false,
    "billing.view": false,
    "audit.view": true,
    "analytics.view": true,
  },
};
