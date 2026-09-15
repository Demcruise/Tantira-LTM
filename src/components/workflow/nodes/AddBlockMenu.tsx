import { Button, Menu, MenuItem, Popover } from "@blueprintjs/core";
import { NODE_KINDS, NODE_META, type NodeKind } from "../../../lib/workflowNodes";

interface AddBlockMenuProps {
  onAdd: (kind: NodeKind) => void;
  label?: string;
  small?: boolean;
}

export function AddBlockMenu({ onAdd, label = "Add a block", small }: AddBlockMenuProps) {
  return (
    <Popover
      placement="bottom"
      minimal
      content={
        <Menu>
          {NODE_KINDS.map((kind) => (
            <MenuItem key={kind} icon={NODE_META[kind].icon} text={NODE_META[kind].label} label={NODE_META[kind].tag} onClick={() => onAdd(kind)} />
          ))}
        </Menu>
      }
    >
      <Button minimal small={small ?? true} icon="add" text={label} className="wf-add-block" />
    </Popover>
  );
}
