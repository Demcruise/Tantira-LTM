import { useState } from "react";
import { Button, Classes, Dialog, FormGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";
import { SYSTEM_ROLES, type MemberRole } from "../../types";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: MemberRole) => void;
}

export function InviteMemberDialog({ isOpen, onClose, onInvite }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("Rep");

  function handleInvite() {
    if (!email.trim()) return;
    onInvite(email.trim(), role);
    setEmail("");
    setRole("Rep");
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
            {SYSTEM_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
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
