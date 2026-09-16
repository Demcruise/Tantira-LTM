import type { AppView } from "../AppSidebar";

const TABS: { view: AppView; label: string }[] = [
  { view: "needs-attention", label: "Attention Center" },
  { view: "auto-processed-log", label: "Auto-Processed" },
  { view: "dashboard", label: "All Leads" },
];

export function LeadsAreaTabs({ current, onChange }: { current: AppView; onChange: (view: AppView) => void }) {
  return (
    <div className="leads-area-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.view}
          type="button"
          className={`leads-area-tabs__tab${current === tab.view ? " leads-area-tabs__tab--active" : ""}`}
          onClick={() => onChange(tab.view)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
