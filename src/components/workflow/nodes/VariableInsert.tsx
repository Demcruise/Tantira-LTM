import { Button, Menu, MenuItem, Popover } from "@blueprintjs/core";

interface VariableInsertProps {
  variables: string[];
  onInsert: (variable: string) => void;
}

export function VariableInsert({ variables, onInsert }: VariableInsertProps) {
  return (
    <Popover
      placement="bottom-start"
      minimal
      content={
        <Menu className="wf-insert-var__menu">
          {variables.map((v) => (
            <MenuItem key={v} text={v} icon="variable" onClick={() => onInsert(v)} />
          ))}
        </Menu>
      }
    >
      <Button small minimal icon="plus" text="Insert variable" className="wf-insert-var" />
    </Popover>
  );
}
