import { Icon } from "@blueprintjs/core";
import type { Lead } from "../../types";

export function OntologyLinks({ lead }: { lead: Lead }) {
  const refs = [
    { type: "Contact", icon: "person" as const, name: lead.name },
    { type: "Account", icon: "office" as const, name: lead.company },
  ];

  return (
    <div className="ontology-links">
      {refs.map((ref) => (
        <div key={ref.type} className="ontology-links__row">
          <span className="ontology-links__icon">
            <Icon icon={ref.icon} size={13} />
          </span>
          <div className="ontology-links__text">
            <div className="ontology-links__type">{ref.type}</div>
            <div className="ontology-links__name">{ref.name}</div>
          </div>
          <Icon icon="link" size={12} className="ontology-links__link-icon" />
        </div>
      ))}
    </div>
  );
}
