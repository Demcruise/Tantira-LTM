import { useState } from "react";
import { Button, Callout, Classes, Dialog, FormGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";
import type { ApiKeyScope } from "../../types";

interface GenerateKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name: string, scope: ApiKeyScope) => { fullKey: string };
}

export function GenerateKeyDialog({ isOpen, onClose, onGenerate }: GenerateKeyDialogProps) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<ApiKeyScope>("Read only");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    if (!name.trim()) return;
    const { fullKey } = onGenerate(name.trim(), scope);
    setRevealedKey(fullKey);
  }

  function handleCopy() {
    if (!revealedKey) return;
    navigator.clipboard?.writeText(revealedKey);
    setCopied(true);
  }

  function handleDone() {
    setName("");
    setScope("Read only");
    setRevealedKey(null);
    setCopied(false);
    onClose();
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={revealedKey ? handleDone : onClose}
      title={revealedKey ? "Your new API key" : "Generate new key"}
      icon={revealedKey ? "key" : "add"}
      canOutsideClickClose={!revealedKey}
    >
      {!revealedKey ? (
        <>
          <div className={Classes.DIALOG_BODY}>
            <FormGroup label="Name" labelFor="key-name">
              <InputGroup id="key-name" placeholder="e.g. CRM Sync Bot" value={name} onChange={(e) => setName(e.target.value)} />
            </FormGroup>
            <FormGroup label="Scope" labelFor="key-scope">
              <HTMLSelect id="key-scope" fill value={scope} onChange={(e) => setScope(e.target.value as ApiKeyScope)}>
                <option value="Read only">Read only</option>
                <option value="Read+Write">Read + Write</option>
              </HTMLSelect>
            </FormGroup>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button text="Cancel" onClick={onClose} />
              <Button intent="primary" text="Generate key" disabled={!name.trim()} onClick={handleGenerate} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={Classes.DIALOG_BODY}>
            <Callout intent="warning" icon="warning-sign" title="This key won't be shown again">
              Copy it now and store it somewhere safe. Once you close this dialog, only a masked version will be visible.
            </Callout>
            <div className="generate-key-dialog__key-row">
              <code className="generate-key-dialog__key">{revealedKey}</code>
              <Button icon={copied ? "tick" : "duplicate"} text={copied ? "Copied" : "Copy"} onClick={handleCopy} />
            </div>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button intent="primary" text="Done" onClick={handleDone} />
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
