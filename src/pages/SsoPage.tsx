import { useState } from "react";
import { Button, Callout, Card, H5, InputGroup, Radio, RadioGroup, Spinner, Switch, Tag } from "@blueprintjs/core";
import type { AttributeMap, SsoConfig, SsoProvider } from "../types";
import { ssoStatus } from "../types";
import { SSO_PROVIDERS, DEFAULT_ATTRIBUTE_MAP } from "../data/sso";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PageHeader } from "../components/PageHeader";

interface SsoPageProps {
  config: SsoConfig;
  onSelectProvider: (provider: SsoProvider) => void;
  onSaveMetadata: (method: "upload" | "url", value: string) => void;
  onSaveAttributeMap: (map: AttributeMap) => void;
  onTestPass: () => void;
  onEnable: () => void;
  onDisable: () => void;
}

const STATUS_INTENT: Record<string, "none" | "warning" | "success"> = {
  "Not configured": "none",
  "Configured, not enabled": "warning",
  Active: "success",
};

function unlockedStep(config: SsoConfig): number {
  if (config.enabled || config.testPassed) return 5;
  if (config.attributeMap.email && config.attributeMap.role && config.attributeMap.department) return 4;
  if (config.metadataMethod && config.metadataValue) return 3;
  if (config.provider) return 2;
  return 1;
}

export function SsoPage({ config, onSelectProvider, onSaveMetadata, onSaveAttributeMap, onTestPass, onEnable, onDisable }: SsoPageProps) {
  const unlocked = unlockedStep(config);
  const [step, setStep] = useState(unlocked);
  const [metadataMethod, setMetadataMethod] = useState<"upload" | "url">(config.metadataMethod ?? "url");
  const [metadataValue, setMetadataValue] = useState(config.metadataValue);
  const [attrMap, setAttrMap] = useState<AttributeMap>(config.attributeMap);
  const [testing, setTesting] = useState(false);
  const [testFailed, setTestFailed] = useState(false);
  const [confirmEnableOpen, setConfirmEnableOpen] = useState(false);

  const status = ssoStatus(config);

  function goTo(target: number) {
    if (target <= unlocked) setStep(target);
  }

  function handleSelectProvider(provider: SsoProvider) {
    onSelectProvider(provider);
    setAttrMap(DEFAULT_ATTRIBUTE_MAP[provider]);
    setStep(2);
  }

  function handleMetadataNext() {
    onSaveMetadata(metadataMethod, metadataValue);
    setStep(3);
  }

  function handleAttrNext() {
    onSaveAttributeMap(attrMap);
    setStep(4);
  }

  function handleTest() {
    setTesting(true);
    setTestFailed(false);
    setTimeout(() => {
      setTesting(false);
      const passed = Math.random() > 0.2;
      if (passed) {
        onTestPass();
        setStep(5);
      } else {
        setTestFailed(true);
      }
    }, 1400);
  }

  return (
    <div className="settings-page">
      <PageHeader
        section="Govern"
        title="Single Sign-On"
        description="Route every login through your identity provider. Configure, test, then enable for the organization."
        actions={
          <Tag large minimal intent={STATUS_INTENT[status]}>
            {status}
          </Tag>
        }
      />

      <Card className="sso-page">
      <div className="sso-page__steps">
        {["Provider", "Metadata", "Attributes", "Test", "Enable"].map((label, i) => {
          const n = i + 1;
          const isUnlocked = n <= unlocked;
          const isCurrent = n === step;
          return (
            <button
              key={label}
              type="button"
              disabled={!isUnlocked}
              onClick={() => goTo(n)}
              className={`sso-page__step${isCurrent ? " sso-page__step--current" : ""}${isUnlocked ? " sso-page__step--unlocked" : ""}`}
            >
              <span className="sso-page__step-num">{n}</span>
              {label}
            </button>
          );
        })}
      </div>

      {step === 1 && (
        <div className="sso-page__panel">
          <H5>Choose provider</H5>
          <div className="sso-page__provider-grid">
            {SSO_PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`sso-page__provider-card${config.provider === p.id ? " sso-page__provider-card--selected" : ""}`}
                onClick={() => handleSelectProvider(p.id)}
              >
                <div className="sso-page__provider-name">{p.id}</div>
                <div className="sso-page__provider-desc">{p.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="sso-page__panel">
          <H5>Enter IdP metadata</H5>
          <RadioGroup selectedValue={metadataMethod} onChange={(e) => setMetadataMethod(e.currentTarget.value as "upload" | "url")}>
            <Radio label="Upload XML file" value="upload" />
            <Radio label="Paste metadata URL" value="url" />
          </RadioGroup>
          {metadataMethod === "url" ? (
            <InputGroup
              placeholder="https://idp.example.com/metadata.xml"
              value={metadataValue}
              onChange={(e) => setMetadataValue(e.target.value)}
            />
          ) : (
            <Button icon="upload" text={metadataValue || "Choose file…"} onClick={() => setMetadataValue("idp-metadata.xml")} />
          )}
          <div className="sso-page__actions">
            <Button minimal text="Back" onClick={() => setStep(1)} />
            <Button intent="primary" text="Continue" disabled={!metadataValue} onClick={handleMetadataNext} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="sso-page__panel">
          <H5>Map attributes</H5>
          <p className="sso-page__hint">Map your IdP's claim names to Tantira fields.</p>
          <div className="sso-page__attr-row">
            <span>Email</span>
            <InputGroup value={attrMap.email} onChange={(e) => setAttrMap({ ...attrMap, email: e.target.value })} />
          </div>
          <div className="sso-page__attr-row">
            <span>Role</span>
            <InputGroup value={attrMap.role} onChange={(e) => setAttrMap({ ...attrMap, role: e.target.value })} />
          </div>
          <div className="sso-page__attr-row">
            <span>Department</span>
            <InputGroup value={attrMap.department} onChange={(e) => setAttrMap({ ...attrMap, department: e.target.value })} />
          </div>
          <div className="sso-page__actions">
            <Button minimal text="Back" onClick={() => setStep(2)} />
            <Button
              intent="primary"
              text="Continue"
              disabled={!attrMap.email || !attrMap.role || !attrMap.department}
              onClick={handleAttrNext}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="sso-page__panel">
          <H5>Test connection</H5>
          <p className="sso-page__hint">Send a test login through {config.provider} to verify the configuration end-to-end.</p>
          <Button intent="primary" icon="send-to" text="Send test login" loading={testing} onClick={handleTest} />
          {testing && (
            <div className="sso-page__testing">
              <Spinner size={14} />
              <span>Validating connection…</span>
            </div>
          )}
          {testFailed && (
            <Callout intent="danger" icon="error" title="Test login failed">
              Could not complete a round-trip login with this configuration. Check your metadata and attribute mapping, then retry.
            </Callout>
          )}
          {config.testPassed && (
            <Callout intent="success" icon="tick-circle" title="Test succeeded">
              Connection verified. You can now enable SSO for the organization.
            </Callout>
          )}
          <div className="sso-page__actions">
            <Button minimal text="Back" onClick={() => setStep(3)} />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="sso-page__panel">
          <H5>Enable for organization</H5>
          {!config.testPassed ? (
            <Callout intent="warning" icon="lock" title="Locked">
              Complete a successful test login in Step 4 before enabling SSO.
            </Callout>
          ) : (
            <>
              <div className="sso-page__enable-row">
                <Switch
                  large
                  checked={config.enabled}
                  label={config.enabled ? "SSO is active" : "Enable SSO for organization"}
                  onChange={() => (config.enabled ? onDisable() : setConfirmEnableOpen(true))}
                />
              </div>
              {config.enabled && (
                <Callout intent="success" icon="tick-circle">
                  SSO is active via {config.provider}. All users must log in through your identity provider.
                </Callout>
              )}
            </>
          )}
          <div className="sso-page__actions">
            <Button minimal text="Back" onClick={() => setStep(4)} />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmEnableOpen}
        title="Enable SSO"
        description="All users will be required to log in via SSO going forward. Make sure every active member can authenticate through your identity provider before continuing."
        confirmText="Enable SSO"
        onClose={() => setConfirmEnableOpen(false)}
        onConfirm={() => {
          onEnable();
          setConfirmEnableOpen(false);
        }}
      />
      </Card>
    </div>
  );
}
