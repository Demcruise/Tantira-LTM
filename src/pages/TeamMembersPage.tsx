import { useState } from "react";
import { Button, Card, HTMLSelect, HTMLTable, Tag } from "@blueprintjs/core";
import type { MemberRole, TeamMember } from "../types";
import { SYSTEM_ROLES } from "../types";
import { InviteMemberDialog } from "../components/team/InviteMemberDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PageHeader } from "../components/PageHeader";

interface TeamMembersPageProps {
  members: TeamMember[];
  onInvite: (email: string, role: MemberRole) => void;
  onChangeRole: (memberId: string, role: MemberRole) => void;
  onResend: (memberId: string) => void;
  onRevoke: (memberId: string) => void;
}

export function TeamMembersPage({ members, onInvite, onChangeRole, onResend, onRevoke }: TeamMembersPageProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<TeamMember | null>(null);

  return (
    <div className="team-page">
      <PageHeader
        title="Team Members"
        description="Who has access to this workspace and what role they hold."
        actions={<Button intent="primary" icon="add" text="Invite member" onClick={() => setInviteOpen(true)} />}
      />

      <Card className="page-card">
      <HTMLTable className="team-page__table" striped>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>{m.status === "Pending" ? <span className="team-page__pending-name">{m.email}</span> : m.name}</td>
              <td>{m.email}</td>
              <td>
                <HTMLSelect
                  minimal
                  value={m.role}
                  onChange={(e) => onChangeRole(m.id, e.target.value as MemberRole)}
                >
                  {SYSTEM_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </HTMLSelect>
              </td>
              <td>
                <Tag minimal intent={m.status === "Active" ? "success" : "warning"}>
                  {m.status}
                </Tag>
              </td>
              <td>
                {m.status === "Pending" && (
                  <div className="team-page__row-actions">
                    <Button minimal small text="Resend" onClick={() => onResend(m.id)} />
                    <Button minimal small intent="danger" text="Revoke" onClick={() => setRevokeTarget(m)} />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
      </Card>

      <InviteMemberDialog isOpen={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={onInvite} />

      <ConfirmDialog
        isOpen={revokeTarget !== null}
        title="Revoke invite"
        description={`This permanently revokes the pending invite for ${revokeTarget?.email}. They will not be able to join using this invite link.`}
        confirmText="Revoke invite"
        onCancel={() => setRevokeTarget(null)}
        onConfirm={() => {
          if (revokeTarget) onRevoke(revokeTarget.id);
          setRevokeTarget(null);
        }}
      />
    </div>
  );
}
