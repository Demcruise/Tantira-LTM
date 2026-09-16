import { Fragment, useState } from "react";
import { Button, Card, Checkbox, HTMLTable, Tag, Tooltip } from "@blueprintjs/core";
import { PERMISSIONS, PERMISSION_MODULES, type PermissionMatrix, type RoleDef } from "../data/permissions";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CreateRoleDialog } from "../components/permissions/CreateRoleDialog";
import { PageHeader } from "../components/PageHeader";

interface RolesPermissionsPageProps {
  roles: RoleDef[];
  matrix: PermissionMatrix;
  onTogglePermission: (roleId: string, permKey: string, granted: boolean) => void;
  onCreateRole: (name: string, scope: string | null) => void;
  onDeleteRole: (roleId: string) => void;
}

export function RolesPermissionsPage({ roles, matrix, onTogglePermission, onCreateRole, onDeleteRole }: RolesPermissionsPageProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<{ roleId: string; permKey: string } | null>(null);
  const [pendingDeleteRole, setPendingDeleteRole] = useState<RoleDef | null>(null);

  function handleCellClick(roleId: string, permKey: string) {
    const current = matrix[roleId]?.[permKey] ?? false;
    if (current) {
      setPendingRevoke({ roleId, permKey });
    } else {
      onTogglePermission(roleId, permKey, true);
    }
  }

  const revokePerm = pendingRevoke ? PERMISSIONS.find((p) => p.key === pendingRevoke.permKey) : undefined;
  const revokeRole = pendingRevoke ? roles.find((r) => r.id === pendingRevoke.roleId) : undefined;

  return (
    <div className="roles-page">
      <PageHeader
        section="Govern"
        title="Roles & Permissions"
        description="What each role can see and do. Enforced live in the nav — a role without a permission below has that area hidden entirely, including this page."
        actions={<Button intent="primary" icon="add" text="Create custom role" onClick={() => setCreateOpen(true)} />}
      />

      <Card className="page-card">
      <div className="roles-page__table-wrap">
        <HTMLTable className="roles-page__table">
          <thead>
            <tr>
              <th className="roles-page__perm-col">Permission</th>
              {roles.map((role) => (
                <th key={role.id} className="roles-page__role-col">
                  <div className="roles-page__role-header">
                    <span>{role.name}</span>
                    <Tooltip content={role.system ? "System roles cannot be removed." : "Delete role"} placement="top">
                      <Button
                        minimal
                        small
                        icon="trash"
                        disabled={role.system}
                        onClick={() => setPendingDeleteRole(role)}
                      />
                    </Tooltip>
                  </div>
                  {role.scope ? (
                    <Tag minimal round intent="primary" className="roles-page__scope-tag">
                      {role.scope} only
                    </Tag>
                  ) : (
                    <span className="roles-page__scope-plain">Workspace-wide</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MODULES.map((module) => (
              <Fragment key={module}>
                <tr className="roles-page__module-row">
                  <td colSpan={roles.length + 1}>{module}</td>
                </tr>
                {PERMISSIONS.filter((p) => p.module === module).map((perm) => (
                  <tr key={perm.key}>
                    <td className="roles-page__perm-label">{perm.label}</td>
                    {roles.map((role) => (
                      <td key={role.id} className="roles-page__cell">
                        <Checkbox
                          checked={matrix[role.id]?.[perm.key] ?? false}
                          onChange={() => handleCellClick(role.id, perm.key)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </HTMLTable>
      </div>
      </Card>

      <CreateRoleDialog isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreate={onCreateRole} />

      <ConfirmDialog
        isOpen={pendingRevoke !== null}
        title="Revoke permission"
        description={`Remove "${revokePerm?.module}: ${revokePerm?.label}" from ${revokeRole?.name}? Members with this role will lose access immediately.`}
        confirmText="Revoke"
        onClose={() => setPendingRevoke(null)}
        onConfirm={() => {
          if (pendingRevoke) onTogglePermission(pendingRevoke.roleId, pendingRevoke.permKey, false);
          setPendingRevoke(null);
        }}
      />

      <ConfirmDialog
        isOpen={pendingDeleteRole !== null}
        title="Delete role"
        description={`Delete the "${pendingDeleteRole?.name}" role? Members assigned to it will need to be reassigned.`}
        confirmText="Delete role"
        onClose={() => setPendingDeleteRole(null)}
        onConfirm={() => {
          if (pendingDeleteRole) onDeleteRole(pendingDeleteRole.id);
          setPendingDeleteRole(null);
        }}
      />
    </div>
  );
}
