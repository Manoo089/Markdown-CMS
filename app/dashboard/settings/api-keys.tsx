"use client";

import { useState } from "react";
import { createApiKey, deleteApiKey } from "./api-keys-actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";

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
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    setError("");
    setNewKey(null);

    const result = await createApiKey(name.trim());

    if (result.error) {
      setError(result.error);
    } else if (result.key) {
      setNewKey(result.key);
      setName("");
    }

    setIsCreating(false);
  };

  const handleDelete = async (keyId: string) => {
    if (!confirm("Are you sure? This will immediately revoke API access.")) {
      return;
    }

    const result = await deleteApiKey(keyId);

    if (result.error) {
      alert(result.error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h3>

      {/* New Key Display */}
      {newKey && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-800 mb-2">
            API Key created! Copy it now - you won&apos;t see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white border rounded text-sm font-mono break-all">{newKey}</code>
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
          </div>

          <Button
            type="submit"
            label={isCreating ? "Creating..." : "Create Key"}
            disabled={isCreating || !name.trim()}
          />
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </form>

      {/* Existing Keys */}
      {apiKeys.length === 0 ? (
        <p className="text-gray-500 text-sm">No API keys yet.</p>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium text-gray-900">{apiKey.name}</p>
                <p className="text-sm text-gray-500">
                  Created {new Date(apiKey.createdAt).toLocaleDateString()}
                  {apiKey.lastUsedAt && <> · Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}</>}
                </p>
              </div>
              <Button
                type="button"
                label="Delete"
                variant="plain"
                color="danger"
                onClick={() => handleDelete(apiKey.id)}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
