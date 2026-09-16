import type { AppView } from "../types";

// Where each role lands after login. Falls back to Attention Center for any
// role this table doesn't know about (custom or scoped roles included).
const ROLE_LANDING: Record<string, AppView> = {
  Rep: "my-leads",
  "Sales Ops": "needs-attention",
  Admin: "needs-attention",
  Reporter: "pipeline",
};

export function landingViewForRole(roleName: string | undefined): AppView {
  if (!roleName) return "needs-attention";
  return ROLE_LANDING[roleName] ?? "needs-attention";
}
