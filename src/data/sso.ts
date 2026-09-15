import type { AttributeMap, SsoConfig, SsoProvider } from "../types";

export const SSO_PROVIDERS: { id: SsoProvider; description: string }[] = [
  { id: "Okta", description: "SAML 2.0 via Okta identity provider" },
  { id: "Azure AD", description: "SAML 2.0 via Microsoft Entra ID" },
  { id: "Google Workspace", description: "SAML 2.0 via Google Workspace" },
  { id: "Custom SAML", description: "Any SAML 2.0-compliant identity provider" },
];

export const DEFAULT_ATTRIBUTE_MAP: Record<SsoProvider, AttributeMap> = {
  Okta: { email: "email", role: "role", department: "department" },
  "Azure AD": { email: "userPrincipalName", role: "roles", department: "department" },
  "Google Workspace": { email: "primaryEmail", role: "orgUnitPath", department: "department" },
  "Custom SAML": { email: "", role: "", department: "" },
};

export const INITIAL_SSO_CONFIG: SsoConfig = {
  provider: null,
  metadataMethod: null,
  metadataValue: "",
  attributeMap: { email: "", role: "", department: "" },
  testPassed: false,
  enabled: false,
};
