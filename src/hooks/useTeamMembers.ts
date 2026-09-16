import { useState } from "react";
import { INITIAL_TEAM } from "../data/team";
import type { MemberRole, TeamMember } from "../types";

type LogAction = (action: string, object: string, before?: string, after?: string) => void;

/** Owns the team member list and its invite/role-change/revoke handlers for the Team Members page. */
export function useTeamMembers(logAction: LogAction) {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_TEAM);

  function handleInviteMember(email: string, role: MemberRole) {
    const id = `TM-${Date.now()}`;
    setMembers((prev) => [...prev, { id, name: email, email, role, status: "Pending" }]);
    logAction("Invited member", email, undefined, `${role}, Pending`);
  }

  function handleChangeRole(memberId: string, role: MemberRole) {
    const member = members.find((m) => m.id === memberId);
    if (!member || member.role === role) return;
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
    logAction("Changed role", member.name, member.role, role);
  }

  function handleResendInvite(memberId: string) {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    logAction("Resent invite", member.email);
  }

  function handleRevokeInvite(memberId: string) {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    logAction("Revoked invite", member.email, `${member.role}, Pending`, "Revoked");
  }

  return { members, handleInviteMember, handleChangeRole, handleResendInvite, handleRevokeInvite };
}
