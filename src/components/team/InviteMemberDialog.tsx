import { useState } from "react";
import { Button, Classes, Dialog, FormGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";
import type { MemberRole } from "../../types";
import type { RoleDef } from "../../data/permissions";

interface InviteMemberDialogProps {
  isOpen: boolean;
  roles: RoleDef[];
  onClose: () => void;
  onInvite: (email: string, role: MemberRole) => void;
}

function defaultRole(roles: RoleDef[]): MemberRole {
  return roles.find((r) => r.name === "Rep")?.name ?? roles[0]?.name ?? "";
}

export function InviteMemberDialog({ isOpen, roles, onClose, onInvite }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>(defaultRole(roles));

  function handleInvite() {
    if (!email.trim()) return;
    onInvite(email.trim(), role);
    setEmail("");
    setRole(defaultRole(roles));
    onClose();
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Invite member" icon="add-to-artifact">
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label="Email" labelFor="invite-email">
          <InputGroup
            id="invite-email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Role" labelFor="invite-role">
          <HTMLSelect id="invite-role" fill value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
                {r.scope ? ` (${r.scope} only)` : ""}
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button text="Cancel" onClick={onClose} />
          <Button intent="primary" text="Send invite" disabled={!email.trim()} onClick={handleInvite} />
        </div>
      </div>
    </Dialog>
  );
}
