/**
 * Shared viewport breakpoint constants.
 *
 * Use these instead of hardcoding pixel values when a component needs to
 * decide behavior based on screen width (e.g. "collapse the sidebar below
 * this width"). For column-visibility thresholds inside a specific component
 * (e.g. LeadsTable's per-column minWidth), keep those local — they're about
 * the component's own layout, not the viewport.
 */

/** Below this width the sidebar collapses to icon-only rail. */
export const SIDEBAR_COLLAPSE_WIDTH = 1366;

/** Below this width the mobile drawer replaces the sidebar entirely. */
export const MOBILE_DRAWER_WIDTH = 768;
