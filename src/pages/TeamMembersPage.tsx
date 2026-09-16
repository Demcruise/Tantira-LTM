import { useState } from "react";
import { Button, Card, Checkbox, HTMLSelect, HTMLTable, Tag } from "@blueprintjs/core";
import type { MemberRole, TeamMember } from "../types";
import type { RoleDef } from "../data/permissions";
import { InviteMemberDialog } from "../components/team/InviteMemberDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PageHeader } from "../components/PageHeader";

interface TeamMembersPageProps {
  members: TeamMember[];
  roles: RoleDef[];
  onInvite: (email: string, role: MemberRole) => void;
  onChangeRole: (memberId: string, role: MemberRole) => void;
  onResend: (memberId: string) => void;
  onRevoke: (memberId: string) => void;
}

/** Extract initials (up to 2 chars) from a name or email. */
function initialsOf(name: string, email: string): string {
  const source = name || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function TeamMembersPage({ members, roles, onInvite, onChangeRole, onResend, onRevoke }: TeamMembersPageProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<TeamMember | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const pendingMembers = members.filter((m) => m.status === "Pending");
  const checkedPending = pendingMembers.filter((m) => checkedIds.has(m.id));
  const allPendingChecked = pendingMembers.length > 0 && checkedPending.length === pendingMembers.length;

  function toggleAll() {
    if (allPendingChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(pendingMembers.map((m) => m.id)));
  }

  function toggleOne(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkResend() {
    checkedPending.forEach((m) => onResend(m.id));
    setCheckedIds(new Set());
  }

  function bulkRevoke() {
    checkedPending.forEach((m) => onRevoke(m.id));
    setCheckedIds(new Set());
  }

  return (
    <div className="team-page">
      <PageHeader
        section="Govern"
        title="Team Members"
        description="Who has access to this workspace and what role they hold."
        actions={<Button intent="primary" icon="add" text="Invite member" onClick={() => setInviteOpen(true)} />}
      />

      {checkedPending.length > 0 && (
        <div className="team-bulk-bar" role="toolbar" aria-label="Bulk actions">
          <span className="team-bulk-bar__count">
            <strong>{checkedPending.length}</strong> pending invite{checkedPending.length === 1 ? "" : "s"} selected
          </span>
          <Button small icon="refresh" text="Resend all" onClick={bulkResend} />
          <Button small intent="danger" icon="cross" text="Revoke all" onClick={bulkRevoke} />
          <Button small minimal text="Clear" onClick={() => setCheckedIds(new Set())} />
        </div>
      )}

      <Card className="page-card">
      <div className="table-scroll-wrap">
        <HTMLTable className="team-page__table">
        <thead>
          <tr>
            <th className="team-page__check-col">
              <Checkbox checked={allPendingChecked} indeterminate={checkedPending.length > 0 && !allPendingChecked} onChange={toggleAll} aria-label="Select all pending" />
            </th>
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
              <td className="team-page__check-col">
                {m.status === "Pending" && (
                  <Checkbox checked={checkedIds.has(m.id)} onChange={() => toggleOne(m.id)} aria-label={`Select ${m.email}`} />
                )}
              </td>
              <td>
                <div className="team-page__name-cell">
                  <span className="team-page__avatar" aria-hidden="true">{initialsOf(m.name, m.email)}</span>
                  {m.status === "Pending" ? <span className="team-page__pending-name">{m.email}</span> : m.name}
                </div>
              </td>
              <td>{m.email}</td>
              <td>
                <div className="team-page__role-cell">
                  <HTMLSelect
                    minimal
                    value={m.role}
                    onChange={(e) => onChangeRole(m.id, e.target.value as MemberRole)}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </HTMLSelect>
                  {(() => {
                    const scope = roles.find((r) => r.name === m.role)?.scope;
                    return scope ? (
                      <Tag minimal round intent="primary">
                        {scope} only
                      </Tag>
                    ) : null;
                  })()}
                </div>
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
      </div>
      </Card>

      <InviteMemberDialog isOpen={inviteOpen} roles={roles} onClose={() => setInviteOpen(false)} onInvite={onInvite} />

      <ConfirmDialog
        isOpen={revokeTarget !== null}
        title="Revoke invite"
        description={`This permanently revokes the pending invite for ${revokeTarget?.email}. They will not be able to join using this invite link.`}
        confirmText="Revoke invite"
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => {
          if (revokeTarget) onRevoke(revokeTarget.id);
          setRevokeTarget(null);
        }}
      />
    </div>
  );
}
