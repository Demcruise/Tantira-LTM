import { OverlayToaster, Position, type Toaster, type ToastProps } from "@blueprintjs/core";

let _toaster: Toaster | null = null;

function toaster(): Toaster {
  if (!_toaster) {
    _toaster = OverlayToaster.create({ position: Position.TOP });
  }
  return _toaster;
}

export const AppToaster = {
  show(props: ToastProps): string {
    return toaster().show(props);
  },
};
