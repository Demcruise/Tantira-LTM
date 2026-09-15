import { Checkbox, HTMLTable, Icon, NonIdealState, Spinner, Tooltip } from "@blueprintjs/core";
import type { Lead } from "../types";
import { PriorityTag, StatusTag } from "./Tags";
import { SlaBadge } from "./SlaBadge";

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  selectedId: string | null;
  checkedIds: Set<string>;
  onSelect: (lead: Lead) => void;
  onToggleChecked: (leadId: string) => void;
  onToggleAll: (leadIds: string[], checked: boolean) => void;
  onClearFilters: () => void;
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function LeadsTable({ leads, loading, selectedId, checkedIds, onSelect, onToggleChecked, onToggleAll, onClearFilters }: LeadsTableProps) {
  if (loading) {
    return (
      <div className="leads-table__loading">
        <Spinner size={32} />
        <p>Loading leads…</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <NonIdealState
        icon="filter-remove"
        title="No leads match these filters"
        description="Try adjusting or clearing your filters to see more results."
        action={<a onClick={onClearFilters}>Clear filters</a>}
      />
    );
  }

  const visibleIds = leads.map((l) => l.id);
  const checkedVisible = visibleIds.filter((id) => checkedIds.has(id)).length;
  const allChecked = checkedVisible === visibleIds.length;

  return (
    <HTMLTable interactive striped className="leads-table">
      <thead>
        <tr>
          <th className="leads-table__check">
            <Checkbox
              checked={allChecked}
              indeterminate={checkedVisible > 0 && !allChecked}
              onChange={() => onToggleAll(visibleIds, !allChecked)}
              aria-label="Select all visible leads"
            />
          </th>
          <th>Lead</th>
          <th>Source</th>
          <th>Priority</th>
          <th>SLA</th>
          <th>Status</th>
          <th>Assigned To</th>
          <th>Last Activity</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr
            key={lead.id}
            onClick={() => onSelect(lead)}
            className={`${lead.id === selectedId ? "leads-table__row--selected" : ""}${checkedIds.has(lead.id) ? " leads-table__row--checked" : ""}`}
          >
            <td className="leads-table__check" onClick={(e) => e.stopPropagation()}>
              <Checkbox checked={checkedIds.has(lead.id)} onChange={() => onToggleChecked(lead.id)} aria-label={`Select ${lead.name}`} />
            </td>
            <td>
              <div className="leads-table__lead-name">
                {lead.name}
                {lead.inNurture && (
                  <Tooltip content="In nurture sequence">
                    <Icon icon="send-to" size={12} className="leads-table__nurture-icon" />
                  </Tooltip>
                )}
              </div>
              <div className="leads-table__lead-company">{lead.company}</div>
            </td>
            <td>{lead.source}</td>
            <td>
              <PriorityTag priority={lead.priority} />
            </td>
            <td>
              <SlaBadge lead={lead} />
            </td>
            <td>
              <StatusTag status={lead.status} />
            </td>
            <td>{lead.assignedTo ?? <span className="leads-table__unassigned">Unassigned</span>}</td>
            <td>{formatRelative(lead.lastActivity)}</td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  );
}
