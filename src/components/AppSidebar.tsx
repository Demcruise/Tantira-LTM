"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Inbox, LogOut, PanelLeftClose, PanelLeftOpen, Plug, Search, Settings, Shield, SlidersHorizontal, Workflow } from "lucide-react";
import type { LeadStatus, Priority } from "../types";
import type { PermissionKey } from "../data/permissions";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdges({
      start: scrollTop > 1,
      end: Math.ceil(scrollTop + clientHeight) < scrollHeight - 1,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    const view = el?.ownerDocument.defaultView;
    if (!el || !view?.ResizeObserver) return;
    const observer = new view.ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  return { ref, edges, onScroll: update };
}

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity] duration-150 ease-out";

export type AppView =
  | "command-center"
  | "approvals"
  | "dashboard"
  | "workflow"
  | "assignment"
  | "pipeline"
  | "team-members"
  | "audit-log"
  | "roles-permissions"
  | "sso"
  | "api-keys"
  | "notification-preferences"
  | "assignment-rules"
  | "prioritization-model"
  | "auto-processed-log"
  | "connections"
  | "needs-attention"
  | "my-leads"
  | "intake"
  | "performance"
  | "lead-full";

export interface FilterPreset {
  status?: LeadStatus | "Open";
  priority?: Priority;
  assignee?: string;
}

interface NavItem {
  label: string;
  view?: AppView;
  filterPreset?: FilterPreset;
  requiredPermission?: PermissionKey;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavSection {
  label: string;
  icon: typeof Inbox;
  groups: NavGroup[];
}

// Do the work → optimize the work → automate the work → connect it → govern it.
const sections: NavSection[] = [
  {
    label: "Operate",
    icon: Inbox,
    groups: [
      {
        label: "Work",
        items: [
          { label: "Command Center", view: "command-center", requiredPermission: "leads.view" },
          { label: "Attention Center", view: "needs-attention", requiredPermission: "leads.view" },
          { label: "My Leads", view: "my-leads", requiredPermission: "leads.view" },
          { label: "All Leads", view: "dashboard", filterPreset: {}, requiredPermission: "leads.view" },
        ],
      },
      { label: "Intake", items: [{ label: "Inbound Sources", view: "intake" }] },
      { label: "Activity", items: [{ label: "Auto-Processed Log", view: "auto-processed-log" }] },
    ],
  },
  {
    label: "Optimize",
    icon: SlidersHorizontal,
    groups: [
      {
        label: "Routing",
        items: [
          { label: "Assignment & SLA", view: "assignment", requiredPermission: "leads.assign" },
          { label: "Assignment Rules", view: "assignment-rules", requiredPermission: "automation.view" },
        ],
      },
      { label: "Scoring", items: [{ label: "Prioritization Model", view: "prioritization-model", requiredPermission: "automation.view" }] },
      { label: "Outcomes", items: [{ label: "Performance", view: "performance", requiredPermission: "analytics.view" }] },
    ],
  },
  {
    label: "Automate",
    icon: Workflow,
    groups: [
      { label: "Build", items: [{ label: "Lead Triage Workflow", view: "workflow", requiredPermission: "automation.edit" }] },
      { label: "Monitor", items: [{ label: "Pipeline Health", view: "pipeline", requiredPermission: "automation.view" }] },
    ],
  },
  {
    label: "Connect",
    icon: Plug,
    groups: [
      { label: "Integrations", items: [{ label: "Connections", view: "connections" }] },
      { label: "Access", items: [{ label: "API Keys", view: "api-keys", requiredPermission: "org.manage" }] },
    ],
  },
  {
    label: "Govern",
    icon: Shield,
    groups: [
      {
        label: "Team",
        items: [
          { label: "Members", view: "team-members", requiredPermission: "org.manage" },
          { label: "Roles & Permissions", view: "roles-permissions", requiredPermission: "org.manage" },
        ],
      },
      { label: "Security", items: [{ label: "SSO", view: "sso", requiredPermission: "org.manage" }] },
      {
        label: "Records",
        items: [
          { label: "Approvals", view: "approvals", requiredPermission: "leads.view" },
          { label: "Audit Log", view: "audit-log", requiredPermission: "audit.view" },
          { label: "Notification Preferences", view: "notification-preferences" },
        ],
      },
    ],
  },
];

interface AppSidebarProps {
  activeView: AppView;
  activeFilters?: FilterPreset;
  onNavigate: (view: AppView, filterPreset?: FilterPreset) => void;
  onLogout?: () => void;
  /** Permission keys granted to the signed-in user's role. An item with a
   * `requiredPermission` not present here is hidden from the nav entirely —
   * this mirrors the Roles & Permissions matrix, so a role change actually
   * changes what shows up here. Items without `requiredPermission` are
   * visible to everyone (no corresponding entry exists in the matrix yet). */
  permissions?: Set<PermissionKey>;
}

export default function AppSidebar({ activeView, activeFilters, onNavigate, onLogout, permissions }: AppSidebarProps) {
  function isItemVisible(item: NavItem): boolean {
    return !item.requiredPermission || (permissions?.has(item.requiredPermission) ?? true);
  }

  const visibleSections = sections
    .map((s) => ({
      ...s,
      groups: s.groups
        .map((g) => ({ ...g, items: g.items.filter(isItemVisible) }))
        .filter((g) => g.items.length > 0),
    }))
    .filter((s) => s.groups.length > 0);

  const initialSectionIndex = visibleSections.findIndex((s) => s.groups.some((g) => g.items.some((i) => i.view === activeView)));
  const [sectionIndex, setSectionIndex] = useState(Math.max(initialSectionIndex, 0));
  const [collapsed, setCollapsed] = useState(false);
  const section = visibleSections[Math.min(sectionIndex, visibleSections.length - 1)];

  function isItemActive(item: NavItem): boolean {
    if (item.view !== activeView) return false;
    if (!item.filterPreset) return true;
    const f = activeFilters ?? {};
    const preset = item.filterPreset;
    const matches = (key: keyof FilterPreset) => (preset[key] ? f[key] === preset[key] : !f[key]);
    return matches("status") && matches("priority") && matches("assignee");
  }

  const rail = useScrollFade<HTMLElement>();
  const pages = useScrollFade<HTMLElement>();

  return (
    <div className="relative flex h-full min-h-[640px] w-full overflow-hidden bg-white dark:bg-neutral-950">
      <aside className="flex w-14 shrink-0 flex-col items-center bg-neutral-50 dark:bg-neutral-900">
        <div className="flex h-14 shrink-0 items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
            T
          </span>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col items-center">
          <nav
            ref={rail.ref}
            onScroll={rail.onScroll}
            aria-label="Sections"
            className="flex h-full flex-col items-center gap-1 overflow-y-auto pb-3"
          >
            {visibleSections.map((s, i) => {
              const Icon = s.icon;
              const current = i === sectionIndex;
              return (
                <button
                  key={s.label}
                  type="button"
                  title={s.label}
                  aria-label={s.label}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setSectionIndex(i)}
                  className={cx(
                    "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] active:bg-neutral-200 dark:active:bg-neutral-700",
                    current
                      ? "bg-[#2d72d2] text-white hover:bg-[#215db0] active:bg-[#184a90]"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                </button>
              );
            })}
          </nav>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              rail.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              rail.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
        <div className="flex w-full shrink-0 flex-col items-center justify-center gap-1 bg-neutral-100/70 py-2 dark:bg-neutral-800/40">
          <button
            type="button"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((c) => !c)}
            className={cx(
              "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] text-neutral-500 hover:bg-white hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-700",
              transition,
              focus,
            )}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            title="Workspace settings"
            aria-label="Workspace settings"
            className={cx(
              "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] text-neutral-500 hover:bg-white hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-700",
              transition,
              focus,
            )}
          >
            <Settings aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {!collapsed && (
      <div className="flex w-full min-w-0 flex-col bg-neutral-50 sm:w-64 sm:shrink-0 dark:bg-neutral-900">
        <div className="flex h-14 shrink-0 items-center gap-2 pl-5 pr-2">
          <h2 className="min-w-0 flex-1 truncate text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            {section.label}
          </h2>
        </div>

        <div className="px-2 pb-2">
          <label className="relative flex items-center">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-500 dark:text-neutral-500"
            />
            <input
              type="search"
              placeholder={`Search ${section.label.toLowerCase()}`}
              aria-label={`Search ${section.label}`}
              className={cx(
                "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-9 pr-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white",
                transition,
                focus,
              )}
            />
          </label>
        </div>

        <div className="relative min-h-0 flex-1">
          <nav
            ref={pages.ref}
            onScroll={pages.onScroll}
            aria-label={`${section.label} pages`}
            className="h-full space-y-4 overflow-y-auto px-2 pb-3"
          >
            {section.groups.map((group) => (
              <div key={group.label}>
                <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const current = isItemActive(item);
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          aria-current={current ? "page" : undefined}
                          onClick={() => item.view && onNavigate(item.view, item.filterPreset)}
                          disabled={!item.view}
                          className={cx(
                            "flex h-8 w-full items-center rounded-[var(--rb-r-md,8px)] px-3 text-left text-[13px] active:bg-neutral-200 dark:active:bg-neutral-700",
                            item.view ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                            current
                              ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                            transition,
                            focus,
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              pages.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              pages.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <div className="shrink-0 bg-neutral-100/70 p-2 dark:bg-neutral-800/40">
          <div className="flex h-11 items-center gap-2.5 rounded-[var(--rb-r-lg,10px)] px-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
              RC
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                Rina Cahyani
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                Sales Ops Lead
              </p>
            </div>
            {onLogout && (
              <button
                type="button"
                title="Log out"
                aria-label="Log out"
                onClick={onLogout}
                className={cx(
                  "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,6px)] text-neutral-500 hover:bg-white hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
