import { useState } from "react";
import { INITIAL_SSO_CONFIG } from "../data/sso";
import { ssoStatus, type AttributeMap, type SsoConfig, type SsoProvider } from "../types";
import { AppToaster } from "../lib/toaster";

type LogAction = (action: string, object: string, before?: string, after?: string) => void;

/** Owns SSO configuration state and its setup/enable/disable handlers for the SSO page. */
export function useSsoConfig(logAction: LogAction) {
  const [ssoConfig, setSsoConfig] = useState<SsoConfig>(INITIAL_SSO_CONFIG);

  function handleSelectProvider(provider: SsoProvider) {
    const before = ssoStatus(ssoConfig);
    setSsoConfig((prev) => ({ ...prev, provider, testPassed: false, enabled: false }));
    logAction("SSO config updated", `${provider} IdP`, before, "Configured, not enabled");
  }

  function handleSaveSsoMetadata(method: "upload" | "url", value: string) {
    setSsoConfig((prev) => ({ ...prev, metadataMethod: method, metadataValue: value, testPassed: false }));
    logAction("SSO metadata saved", `${ssoConfig.provider} IdP`, undefined, method === "upload" ? value : "Metadata URL set");
  }

  function handleSaveAttributeMap(map: AttributeMap) {
    setSsoConfig((prev) => ({ ...prev, attributeMap: map, testPassed: false }));
    logAction("SSO attributes mapped", `${ssoConfig.provider} IdP`);
  }

  function handleSsoTestPass() {
    setSsoConfig((prev) => ({ ...prev, testPassed: true }));
    logAction("SSO test login succeeded", `${ssoConfig.provider} IdP`);
  }

  function handleEnableSso() {
    setSsoConfig((prev) => ({ ...prev, enabled: true }));
    logAction("SSO config updated", `${ssoConfig.provider} IdP`, "Configured, not enabled", "Active");
    AppToaster.show({ icon: "tick-circle", intent: "success", message: `SSO is now active via ${ssoConfig.provider}.` });
  }

  function handleDisableSso() {
    setSsoConfig((prev) => ({ ...prev, enabled: false }));
    logAction("SSO config updated", `${ssoConfig.provider} IdP`, "Active", "Configured, not enabled");
    AppToaster.show({ icon: "warning-sign", intent: "warning", message: "SSO disabled. Users can log in with passwords again." });
  }

  function ssoAvailableForEmail(email: string) {
    return email.toLowerCase().endsWith("@tantira.co") && ssoConfig.enabled;
  }

  return {
    ssoConfig,
    ssoAvailableForEmail,
    handleSelectProvider,
    handleSaveSsoMetadata,
    handleSaveAttributeMap,
    handleSsoTestPass,
    handleEnableSso,
    handleDisableSso,
  };
}
