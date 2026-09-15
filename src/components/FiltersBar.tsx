import { Button, HTMLSelect, InputGroup } from "@blueprintjs/core";
import type { LeadStatus, Priority } from "../types";

export interface Filters {
  search: string;
  status: LeadStatus | "All" | "Open";
  priority: Priority | "All";
  assignee: string | "All";
}

interface FiltersBarProps {
  filters: Filters;
  assigneeOptions: string[];
  resultCount: number;
  totalCount: number;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

export function FiltersBar({ filters, assigneeOptions, resultCount, totalCount, onChange, onClear }: FiltersBarProps) {
  const hasActiveFilters =
    filters.search !== "" || filters.status !== "All" || filters.priority !== "All" || filters.assignee !== "All";

  return (
    <div className="filters-bar">
      <InputGroup
        leftIcon="search"
        placeholder="Search name, company, or email…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="filters-bar__search"
      />
      <HTMLSelect
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as Filters["status"] })}
      >
        <option value="All">All statuses</option>
        <option value="Open">Open (not Lost)</option>
        <option value="New">New</option>
        <option value="Contacted">Contacted</option>
        <option value="Qualified">Qualified</option>
        <option value="Assigned">Assigned</option>
        <option value="Lost">Lost</option>
      </HTMLSelect>
      <HTMLSelect
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as Filters["priority"] })}
      >
        <option value="All">All priorities</option>
        <option value="Hot">Hot</option>
        <option value="Warm">Warm</option>
        <option value="Cold">Cold</option>
      </HTMLSelect>
      <HTMLSelect
        value={filters.assignee}
        onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
      >
        <option value="All">All assignees</option>
        <option value="Unassigned">Unassigned</option>
        {assigneeOptions.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </HTMLSelect>
      {hasActiveFilters && <Button minimal icon="cross" text="Clear filters" onClick={onClear} />}
      <div className="filters-bar__count">
        Showing {resultCount} of {totalCount} leads
      </div>
    </div>
  );
}
