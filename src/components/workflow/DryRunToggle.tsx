import { Switch } from "@blueprintjs/core";

interface DryRunToggleProps {
  testMode: boolean;
  onToggle: (next: boolean) => void;
}

export function DryRunToggle({ testMode, onToggle }: DryRunToggleProps) {
  return (
    <Switch
      className="wf-dryrun-toggle"
      checked={testMode}
      label={testMode ? "Test mode on" : "Test mode"}
      onChange={(e) => onToggle(e.currentTarget.checked)}
    />
  );
}
