import { useState } from "react";
import { Button, Card, HTMLTable, Tag } from "@blueprintjs/core";
import type { ApiKey, ApiKeyScope } from "../types";
import { GenerateKeyDialog } from "../components/api-keys/GenerateKeyDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PageHeader } from "../components/PageHeader";

const STALE_DAYS = 90;

function formatLastUsed(iso: string | null): string {
  if (!iso) return "Never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function isStale(iso: string | null): boolean {
  if (!iso) return true;
  const days = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
  return days >= STALE_DAYS;
}

interface ApiKeysPageProps {
  keys: ApiKey[];
  onGenerate: (name: string, scope: ApiKeyScope) => { fullKey: string };
  onRevoke: (keyId: string) => void;
}

export function ApiKeysPage({ keys, onGenerate, onRevoke }: ApiKeysPageProps) {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);

  return (
    <div className="api-keys-page">
      <PageHeader
        section="Connect"
        title="API Keys"
        description="Keys integrations use to write into Tantira. Revoke anything you don't recognize."
        actions={<Button intent="primary" icon="add" text="Generate new key" onClick={() => setGenerateOpen(true)} />}
      />

      <Card className="page-card">
      <HTMLTable className="api-keys-page__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Key</th>
            <th>Scope</th>
            <th>Last used</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr key={k.id}>
              <td>{k.name}</td>
              <td>
                <code className="api-keys-page__key">{k.maskedKey}</code>
              </td>
              <td>{k.scope}</td>
              <td>
                <div className="api-keys-page__last-used">
                  <span>{formatLastUsed(k.lastUsed)}</span>
                  {isStale(k.lastUsed) && (
                    <Tag minimal intent="warning" round>
                      Unused for 90+ days
                    </Tag>
                  )}
                </div>
              </td>
              <td>
                <Button minimal small intent="danger" text="Revoke" onClick={() => setRevokeTarget(k)} />
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
      </Card>

      <GenerateKeyDialog isOpen={generateOpen} onClose={() => setGenerateOpen(false)} onGenerate={onGenerate} />

      <ConfirmDialog
        isOpen={revokeTarget !== null}
        title="Revoke API key"
        description={`Revoke "${revokeTarget?.name}"? Any integration using this key will immediately lose access. This cannot be undone.`}
        confirmText="Revoke key"
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => {
          if (revokeTarget) onRevoke(revokeTarget.id);
          setRevokeTarget(null);
        }}
      />
    </div>
  );
}
