import { Checkbox, Icon, NonIdealState, Spinner, Tooltip } from "@blueprintjs/core";
import { Cell, Column, ColumnHeaderCell, Table2 } from "@blueprintjs/table";
import type { Lead } from "../types";
import { PriorityTag, SegmentTag, StatusTag } from "./Tags";
import { SlaBadge } from "./SlaBadge";
import { Sparkline, activityBars } from "./Sparkline";
import { getEnrichmentData } from "../lib/enrichment";

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  selectedId: string | null;
  checkedIds: Set<string>;
  onOpenLead: (leadId: string) => void;
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

const COLUMN_WIDTHS = [40, 220, 120, 110, 100, 130, 110, 140, 70, 120];

export function LeadsTable({ leads, loading, selectedId, checkedIds, onOpenLead, onToggleChecked, onToggleAll, onClearFilters }: LeadsTableProps) {
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

  function rowClass(lead: Lead): string {
    return `leads-table2__row${lead.id === selectedId ? " leads-table2__row--selected" : ""}${checkedIds.has(lead.id) ? " leads-table2__row--checked" : ""}`;
  }

  return (
    <div className="leads-table2">
      <Table2
        numRows={leads.length}
        enableRowHeader={false}
        enableColumnResizing
        enableGhostCells={false}
        defaultRowHeight={56}
        columnWidths={COLUMN_WIDTHS}
      >
        <Column
          name=""
          columnHeaderCellRenderer={() => (
            <ColumnHeaderCell>
              <div className="leads-table2__select-all" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={allChecked}
                  indeterminate={checkedVisible > 0 && !allChecked}
                  onChange={() => onToggleAll(visibleIds, !allChecked)}
                  aria-label="Select all visible leads"
                />
              </div>
            </ColumnHeaderCell>
          )}
          cellRenderer={(rowIndex) => {
            const lead = leads[rowIndex];
            return (
              <Cell className={rowClass(lead)} interactive={false}>
                <div className="leads-table2__check-cell" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={checkedIds.has(lead.id)} onChange={() => onToggleChecked(lead.id)} aria-label={`Select ${lead.name}`} />
                </div>
              </Cell>
            );
          }}
        />
        <Column
          name="Lead"
          cellRenderer={(rowIndex) => {
            const lead = leads[rowIndex];
            return (
              <Cell className={rowClass(lead)} interactive={false}>
                <div className="leads-table2__cell-click" onClick={() => onOpenLead(lead.id)}>
                  <div className="leads-table__lead-name">
                    {lead.name}
                    {lead.inNurture && (
                      <Tooltip content="In nurture sequence">
                        <Icon icon="send-to" size={12} className="leads-table__nurture-icon" />
                      </Tooltip>
                    )}
                  </div>
                  <div className="leads-table__lead-company">{lead.company}</div>
                </div>
              </Cell>
            );
          }}
        />
        <Column
          name="Source"
          cellRenderer={(rowIndex) => {
            const lead = leads[rowIndex];
            return (
              <Cell className={rowClass(lead)} interactive={false}>
                <div className="leads-table2__cell-click" onClick={() => onOpenLead(lead.id)}>
                  {lead.source}
                </div>
              </Cell>
            );
          }}
        />
        <Column
          name="Segment"
          cellRenderer={(rowIndex) => {
            const lead = leads[rowIndex];
            return (
              <Cell className={rowClass(lead)} interactive={false}>
                <div className="leads-table2__cell-click" onClick={() => onOpenLead(lead.id)}>
                  <SegmentTag segment={getEnrichmentData(lead).segment} />
                </div>
              </Cell>
            );
          }}
        />
        <Column
          name="Priority"
          cellRenderer={(rowIndex) => {
            const lead = leads[rowIndex];
            return (
              <Cell className={rowClass(lead)} interactive={false}>
                <div className="leads-table2__cell-click" onClick={() => onOpenLead(lead.id)}>
                  <PriorityTag priority={lead.priority} />
                </div>
              </Cell>
            );
          }}
        />
        <Column
          name="SLA"
          cellRenderer={(rowIndex) => {
            const lead = leads[rowIndex];
            return (
              <Cell className={rowClass(lead)} interactive={false}>
                <div className="leads-table2__cell-click" onClick={() => onOpenLead(lead.id)}>
                  <SlaBadge lead={lead} />
                </div>
              </Cell>
            );
          }}
        />
        <Column
          name="Status"
          cellRenderer={(rowIndex) => {
            const lead = leads[rowIndex];
            return (
              <Cell className={rowClass(lead)} interactive={false}>
                <div className="leads-table2__cell-click" onClick={() => onOpenLead(lead.id)}>
                  <StatusTag status={lead.status} />
                </div>
              </Cell>
            );
          }}
        />
        <Column
          name="Assigned To"
          cellRenderer={(rowIndex) => {
            const lead = leads[rowIndex];
            return (
              <Cell className={rowClass(lead)} interactive={false}>
                <div className="leads-table2__cell-click" onClick={() => onOpenLead(lead.id)}>
                  {lead.assignedTo ?? <span className="leads-table__unassigned">Unassigned</span>}
                </div>
              </Cell>
            );
          }}
        />
        <Column
          name="Activity"
          cellRenderer={(rowIndex) => {
            const lead = leads[rowIndex];
            const level = getEnrichmentData(lead).engagementEvents;
            return (
              <Cell className={rowClass(lead)} interactive={false}>
                <div className="leads-table2__cell-click" onClick={() => onOpenLead(lead.id)}>
                  <Sparkline values={activityBars(lead.id, level)} />
                </div>
              </Cell>
            );
          }}
        />
        <Column
          name="Last Activity"
          cellRenderer={(rowIndex) => {
            const lead = leads[rowIndex];
            return (
              <Cell className={rowClass(lead)} interactive={false}>
                <div className="leads-table2__cell-click" onClick={() => onOpenLead(lead.id)}>
                  {formatRelative(lead.lastActivity)}
                </div>
              </Cell>
            );
          }}
        />
      </Table2>
    </div>
  );
}
