import { useState } from "react";
import { INITIAL_API_KEYS, generateApiKey } from "../data/apiKeys";
import type { ApiKey, ApiKeyScope } from "../types";
import { AppToaster } from "../lib/toaster";

type LogAction = (action: string, object: string, before?: string, after?: string) => void;

/** Owns the API key list and its generate/revoke handlers for the API Keys page. */
export function useApiKeys(logAction: LogAction) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);

  function handleGenerateApiKey(name: string, scope: ApiKeyScope): { fullKey: string } {
    const { fullKey, maskedKey } = generateApiKey();
    const id = `AK-${Date.now()}`;
    setApiKeys((prev) => [...prev, { id, name, maskedKey, scope, lastUsed: null, createdAt: new Date().toISOString() }]);
    logAction("API key generated", name, undefined, scope);
    return { fullKey };
  }

  function handleRevokeApiKey(keyId: string) {
    const key = apiKeys.find((k) => k.id === keyId);
    if (!key) return;
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    logAction("API key revoked", key.name, key.maskedKey, "Revoked");
    AppToaster.show({ icon: "key", intent: "danger", message: `Revoked API key "${key.name}".` });
  }

  return { apiKeys, handleGenerateApiKey, handleRevokeApiKey };
}
