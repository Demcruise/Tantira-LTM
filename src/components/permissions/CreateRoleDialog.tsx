import { useState } from "react";
import { Button, Classes, Dialog, FormGroup, InputGroup } from "@blueprintjs/core";

interface CreateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreateRoleDialog({ isOpen, onClose, onCreate }: CreateRoleDialogProps) {
  const [name, setName] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
    onClose();
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create custom role" icon="new-person">
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label="Role name" labelFor="role-name">
          <InputGroup
            id="role-name"
            placeholder="e.g. Marketing Analyst"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </FormGroup>
        <p className="create-role-dialog__hint">New roles start with every permission unchecked.</p>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button text="Cancel" onClick={onClose} />
          <Button intent="primary" text="Create role" disabled={!name.trim()} onClick={handleCreate} />
        </div>
      </div>
    </Dialog>
  );
}
