"use client";

import { useState } from "react";
import { createApiKey, deleteApiKey } from "./api-keys-actions";

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
            <button
              onClick={() => copyToClipboard(newKey)}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Create Form */}
      <form onSubmit={handleCreate} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g., Production)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isCreating || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Key"}
          </button>
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
              <button
                onClick={() => handleDelete(apiKey.id)}
                className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
