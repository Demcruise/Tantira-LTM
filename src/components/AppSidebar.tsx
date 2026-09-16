import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { AppView, FilterPreset } from "../types";
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
  icon: IconName;
  groups: NavGroup[];
}

// Do the work → optimize the work → automate the work → connect it → govern it.
const sections: NavSection[] = [
  {
    label: "Operate",
    icon: "inbox",
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
    icon: "properties",
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
    icon: "flow-branch",
    groups: [
      { label: "Build", items: [{ label: "Lead Triage Workflow", view: "workflow", requiredPermission: "automation.edit" }] },
      { label: "Monitor", items: [{ label: "Pipeline Health", view: "pipeline", requiredPermission: "automation.view" }] },
    ],
  },
  {
    label: "Connect",
    icon: "data-connection",
    groups: [
      { label: "Integrations", items: [{ label: "Connections", view: "connections", requiredPermission: "org.manage" }] },
      { label: "Access", items: [{ label: "API Keys", view: "api-keys", requiredPermission: "org.manage" }] },
    ],
  },
  {
    label: "Govern",
    icon: "shield",
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
  /** Mobile drawer open state — controlled by parent so AppHeader can toggle it. */
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({ activeView, activeFilters, onNavigate, onLogout, permissions, mobileOpen, onCloseMobile }: AppSidebarProps) {
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
  // Default to collapsed on laptop-width screens so the sidebar doesn't compound
  // other components' responsive column-dropping — the toggle still works either way.
  const [collapsed, setCollapsed] = useState(() => typeof window !== "undefined" && window.innerWidth < 1366);
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

  function handleNavigate(view: AppView, filterPreset?: FilterPreset) {
    onNavigate(view, filterPreset);
    onCloseMobile?.();
  }

  return (
    <>
      {mobileOpen && <div className="app-sidebar-backdrop" onClick={onCloseMobile} aria-hidden="true" />}
      <div className={cx("app-sidebar", mobileOpen && "app-sidebar--mobile-open")}>
        <div className="nav-sidebar">
      <aside className="nav-sidebar__rail">
        <div className="nav-sidebar__logo">
          <span className="nav-sidebar__logo-mark">T</span>
        </div>
        <div className="nav-sidebar__rail-scroll-area">
          <nav
            ref={rail.ref}
            onScroll={rail.onScroll}
            aria-label="Sections"
            className="nav-sidebar__rail-nav"
          >
            {visibleSections.map((s, i) => {
              const current = i === sectionIndex;
              return (
                <button
                  key={s.label}
                  type="button"
                  title={s.label}
                  aria-label={s.label}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setSectionIndex(i)}
                  className={cx("nav-sidebar__rail-btn", current && "nav-sidebar__rail-btn--active")}
                >
                  <Icon icon={s.icon} />
                </button>
              );
            })}
          </nav>
          <div aria-hidden="true" className={cx("nav-sidebar__fade", "nav-sidebar__fade--top", !rail.edges.start && "nav-sidebar__fade--hidden")} />
          <div aria-hidden="true" className={cx("nav-sidebar__fade", "nav-sidebar__fade--bottom", !rail.edges.end && "nav-sidebar__fade--hidden")} />
        </div>
        <div className="nav-sidebar__rail-footer">
          <button
            type="button"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((c) => !c)}
            className="nav-sidebar__icon-btn"
          >
            <Icon icon={collapsed ? "menu-open" : "menu-closed"} />
          </button>
          <button
            type="button"
            title="Workspace settings"
            aria-label="Workspace settings"
            className="nav-sidebar__icon-btn"
          >
            <Icon icon="cog" />
          </button>
        </div>
      </aside>

      {!collapsed && (
        <div className="nav-sidebar__panel">
          <div className="nav-sidebar__header">
            <h2 className="nav-sidebar__title">{section.label}</h2>
          </div>

          <div className="nav-sidebar__search">
            <label className="nav-sidebar__search-field">
              <Icon icon="search" className="nav-sidebar__search-icon" />
              <input
                type="search"
                placeholder={`Search ${section.label.toLowerCase()}`}
                aria-label={`Search ${section.label}`}
                className="nav-sidebar__search-input"
              />
            </label>
          </div>

          <div className="nav-sidebar__pages-area">
            <nav
              ref={pages.ref}
              onScroll={pages.onScroll}
              aria-label={`${section.label} pages`}
              className="nav-sidebar__pages"
            >
              {section.groups.map((group) => (
                <div key={group.label} className="nav-sidebar__group">
                  <p className="nav-sidebar__group-label">{group.label}</p>
                  <ul className="nav-sidebar__item-list">
                    {group.items.map((item) => {
                      const current = isItemActive(item);
                      return (
                        <li key={item.label}>
                          <button
                            type="button"
                            aria-current={current ? "page" : undefined}
                            onClick={() => item.view && handleNavigate(item.view, item.filterPreset)}
                            disabled={!item.view}
                            className={cx(
                              "nav-sidebar__item",
                              current && "nav-sidebar__item--active",
                              !item.view && "nav-sidebar__item--disabled",
                            )}
                          >
                            <span className="nav-sidebar__item-label">{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <div aria-hidden="true" className={cx("nav-sidebar__fade", "nav-sidebar__fade--top", !pages.edges.start && "nav-sidebar__fade--hidden")} />
            <div aria-hidden="true" className={cx("nav-sidebar__fade", "nav-sidebar__fade--bottom", !pages.edges.end && "nav-sidebar__fade--hidden")} />
          </div>

          <div className="nav-sidebar__profile">
            <div className="nav-sidebar__profile-inner">
              <span className="nav-sidebar__avatar">RC</span>
              <div className="nav-sidebar__profile-info">
                <p className="nav-sidebar__profile-name">Rina Cahyani</p>
                <p className="nav-sidebar__profile-role">Sales Ops Lead</p>
              </div>
              {onLogout && (
                <button
                  type="button"
                  title="Log out"
                  aria-label="Log out"
                  onClick={onLogout}
                  className="nav-sidebar__logout-btn"
                >
                  <Icon icon="log-out" iconSize={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}
