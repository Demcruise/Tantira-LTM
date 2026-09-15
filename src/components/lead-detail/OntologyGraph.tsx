import { Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { Lead } from "../../types";

interface GraphNode {
  label: string;
  relation: string;
  icon: IconName;
  children?: GraphNode[];
}

function buildGraph(lead: Lead): GraphNode {
  const accountChildren: GraphNode[] = [];
  if (lead.assignedTo) {
    accountChildren.push({ label: lead.assignedTo, relation: "account owner", icon: "person" });
  }
  if (lead.outcome === "Won") {
    accountChildren.push({ label: `${lead.company} deal`, relation: "opportunity", icon: "briefcase" });
  }

  return {
    label: lead.name,
    relation: "lead",
    icon: "id-number",
    children: [
      { label: lead.company, relation: "works at", icon: "office", children: accountChildren.length > 0 ? accountChildren : undefined },
      { label: lead.source, relation: "source", icon: "flow-end" },
      ...(lead.assignedTo ? [{ label: lead.assignedTo, relation: "assigned to", icon: "send-to" } as GraphNode] : []),
    ],
  };
}

function GraphBranch({ node }: { node: GraphNode }) {
  return (
    <li className="ontology-graph__branch">
      <div className="ontology-graph__node">
        <Icon icon={node.icon} size={12} />
        <span className="ontology-graph__relation">{node.relation}</span>
        <span className="ontology-graph__label">{node.label}</span>
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="ontology-graph__children">
          {node.children.map((child, i) => (
            <GraphBranch key={i} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function OntologyGraph({ lead }: { lead: Lead }) {
  const root = buildGraph(lead);
  return (
    <div className="ontology-graph">
      <div className="ontology-graph__root">
        <Icon icon={root.icon} size={13} />
        {root.label}
      </div>
      <ul className="ontology-graph__children ontology-graph__children--root">
        {(root.children ?? []).map((child, i) => (
          <GraphBranch key={i} node={child} />
        ))}
      </ul>
    </div>
  );
}
