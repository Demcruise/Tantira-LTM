import { useEffect, useRef, useState } from "react";
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

function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const view = el?.ownerDocument.defaultView;
    if (!el || !view?.ResizeObserver) return;
    setWidth(el.clientWidth);
    const observer = new view.ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

const CHECKBOX_WIDTH = 40;
const LEAD_WIDTH = 220;

interface DataColumn {
  key: string;
  name: string;
  width: number;
  minWidth: number;
  render: (lead: Lead) => React.ReactNode;
}

// Always shown: checkbox + Lead. Everything below drops out, in this order,
// as the container narrows — the full record is still one click away via onOpenLead.
const DATA_COLUMNS: DataColumn[] = [
  { key: "priority", name: "Priority", width: 100, minWidth: 0, render: (lead) => <PriorityTag priority={lead.priority} /> },
  { key: "status", name: "Status", width: 110, minWidth: 0, render: (lead) => <StatusTag status={lead.status} /> },
  {
    key: "assignedTo",
    name: "Assigned To",
    width: 140,
    minWidth: 650,
    render: (lead) => lead.assignedTo ?? <span className="leads-table__unassigned">Unassigned</span>,
  },
  { key: "sla", name: "SLA", width: 130, minWidth: 750, render: (lead) => <SlaBadge lead={lead} /> },
  { key: "segment", name: "Segment", width: 110, minWidth: 850, render: (lead) => <SegmentTag segment={getEnrichmentData(lead).segment} /> },
  { key: "source", name: "Source", width: 120, minWidth: 950, render: (lead) => lead.source },
  {
    key: "activity",
    name: "Activity",
    width: 70,
    minWidth: 1040,
    render: (lead) => <Sparkline values={activityBars(lead.id, getEnrichmentData(lead).engagementEvents)} />,
  },
  { key: "lastActivity", name: "Last Activity", width: 120, minWidth: 1160, render: (lead) => formatRelative(lead.lastActivity) },
];

export function LeadsTable({ leads, loading, selectedId, checkedIds, onOpenLead, onToggleChecked, onToggleAll, onClearFilters }: LeadsTableProps) {
  const { ref: wrapperRef, width: containerWidth } = useMeasuredWidth<HTMLDivElement>();

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
  const visibleColumns = containerWidth === 0 ? DATA_COLUMNS : DATA_COLUMNS.filter((c) => containerWidth >= c.minWidth);

  function rowClass(lead: Lead): string {
    return `leads-table2__row${lead.id === selectedId ? " leads-table2__row--selected" : ""}${checkedIds.has(lead.id) ? " leads-table2__row--checked" : ""}`;
  }

  return (
    <div className="leads-table2" ref={wrapperRef}>
      <Table2
        // Table2 doesn't reliably re-layout when the number of Column children
        // shrinks/grows in place (stale headers survive a live window resize) —
        // force a clean remount whenever the responsive column set changes.
        key={visibleColumns.map((c) => c.key).join(",")}
        numRows={leads.length}
        enableRowHeader={false}
        enableColumnResizing
        enableGhostCells={false}
        defaultRowHeight={56}
        columnWidths={[CHECKBOX_WIDTH, LEAD_WIDTH, ...visibleColumns.map((c) => c.width)]}
      >
        {[
          <Column
            key="__checkbox"
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
          />,
          <Column
            key="__lead"
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
          />,
          ...visibleColumns.map((col) => (
            <Column
              key={col.key}
              name={col.name}
              cellRenderer={(rowIndex) => {
                const lead = leads[rowIndex];
                return (
                  <Cell className={rowClass(lead)} interactive={false}>
                    <div className="leads-table2__cell-click" onClick={() => onOpenLead(lead.id)}>
                      {col.render(lead)}
                    </div>
                  </Cell>
                );
              }}
            />
          )),
        ]}
      </Table2>
    </div>
  );
}
