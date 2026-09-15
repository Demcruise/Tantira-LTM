import { useState } from "react";
import { Button, Classes, Dialog, FormGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";
import { ALL_TERRITORIES } from "../../data/reps";

const WORKSPACE_WIDE = "__workspace__";

interface CreateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, scope: string | null) => void;
}

export function CreateRoleDialog({ isOpen, onClose, onCreate }: CreateRoleDialogProps) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState(WORKSPACE_WIDE);

  function handleCreate() {
    if (!name.trim()) return;
    onCreate(name.trim(), scope === WORKSPACE_WIDE ? null : scope);
    setName("");
    setScope(WORKSPACE_WIDE);
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
        <FormGroup label="Scope" labelFor="role-scope" helperText="Restrict this role's permissions to one territory, or leave it workspace-wide.">
          <HTMLSelect id="role-scope" fill value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value={WORKSPACE_WIDE}>Workspace-wide</option>
            {ALL_TERRITORIES.map((t) => (
              <option key={t} value={t}>
                {t} only
              </option>
            ))}
          </HTMLSelect>
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
