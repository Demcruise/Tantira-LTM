import { Button, Classes, Dialog } from "@blueprintjs/core";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ isOpen, title, description, confirmText = "Confirm", onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} icon="warning-sign" canOutsideClickClose={false}>
      <div className={Classes.DIALOG_BODY}>
        <p>{description}</p>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button text="Cancel" onClick={onClose} />
          <Button intent="danger" text={confirmText} onClick={onConfirm} />
        </div>
      </div>
    </Dialog>
  );
}
