import type { ApiKey } from "../types";

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

export const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "AK-1",
    name: "CRM Sync Bot",
    maskedKey: "tk_live_****7f2a",
    scope: "Read+Write",
    lastUsed: hoursAgo(2),
    createdAt: hoursAgo(24 * 120),
  },
  {
    id: "AK-2",
    name: "Analytics",
    maskedKey: "tk_live_****9c1b",
    scope: "Read only",
    lastUsed: hoursAgo(24 * 5),
    createdAt: hoursAgo(24 * 200),
  },
  {
    id: "AK-3",
    name: "Legacy Export Script",
    maskedKey: "tk_live_****3d10",
    scope: "Read only",
    lastUsed: hoursAgo(24 * 140),
    createdAt: hoursAgo(24 * 300),
  },
];

function randomHex(length: number): string {
  const bytes = new Uint8Array(length / 2);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateApiKey(): { fullKey: string; maskedKey: string } {
  const secret = randomHex(32);
  const fullKey = `tk_live_${secret}`;
  const maskedKey = `tk_live_****${secret.slice(-4)}`;
  return { fullKey, maskedKey };
}
