"use client";

import { useState } from "react";
import { createApiKey, deleteApiKey } from "./api-keys-actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import { useActionState } from "@/hooks/useActionState";
import { FieldError, MessageAlert } from "@/components/MessageAlert";

interface ApiKey {
  id: string;
  name: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

interface Props {
  apiKeys: ApiKey[];
}

export function ApiKeys({ apiKeys }: Props) {
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState("");

  const createAction = useActionState<string, string>();
  const deleteAction = useActionState();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createAction.execute(createApiKey, name.trim(), {
      successMessage: "API Key created! Copy it now - you won't see it again.",
      onSuccess: (data: string) => {
        // data ist der API Key String
        setNewKey(data);
        setName("");
      },
    });
  };

  const handleDelete = async (keyId: string) => {
    if (!confirm("Are you sure? This will immediately revoke API access.")) {
      return;
    }

    await deleteAction.execute(deleteApiKey, keyId, {
      successMessage: "API Key deleted successfully",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const dismissNewKey = () => {
    setNewKey("");
    createAction.clearErrors();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-text mb-4">API Keys</h3>

      <MessageAlert
        message={deleteAction.message}
        onDismiss={deleteAction.clearErrors}
      />

      {/* New Key Display */}
      {newKey && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              ✓ API Key created! Copy it now - you won&apos;t see it again.
            </p>
            <button
              onClick={dismissNewKey}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white dark:bg-gray-800 border border-border rounded text-sm font-mono break-all">
              {newKey}
            </code>
            <Button
              type="button"
              label="Copy"
              variant="solid"
              color="success"
              onClick={() => copyToClipboard(newKey)}
              className="px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {/* Create Form */}
      <form onSubmit={handleCreate} className="w-full mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <InputField
              id="keyName"
              label=""
              type="text"
              value={name}
              placeholder="Key name (e.g., Production)"
              fullWidth
              onChange={(e) => setName(e.target.value)}
            />
            <FieldError error={createAction.fieldErrors.name} />
          </div>

          <Button
            type="submit"
            label={createAction.isLoading ? "Creating..." : "Create Key"}
            disabled={createAction.isLoading || !name.trim()}
          />
        </div>
      </form>

      {/* Existing Keys */}
      {apiKeys.length === 0 ? (
        <p className="text-text-muted text-sm">No API keys yet.</p>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="flex items-center justify-between p-3 bg-surface border border-border rounded-md"
            >
              <div>
                <p className="font-medium text-text">{apiKey.name}</p>
                <p className="text-sm text-text-subtle">
                  Created {new Date(apiKey.createdAt).toLocaleDateString()}
                  {apiKey.lastUsedAt && (
                    <>
                      {" "}
                      · Last used{" "}
                      {new Date(apiKey.lastUsedAt).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
              <Button
                type="button"
                label="Delete"
                variant="plain"
                color="danger"
                onClick={() => handleDelete(apiKey.id)}
                disabled={deleteAction.isLoading}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
