"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "./actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";

export function CreateOrganizationForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await createOrganization({ name, slug });

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.organizationId) {
      router.push(`/admin/organizations/${result.organizationId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        id="organization_name"
        type="text"
        label="Organization Name"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        placeholder="Acme Inc."
        description="The display name of the organization"
        required
      />

      <InputField
        id="slug"
        type="text"
        label="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="acme-inc"
        description="Used in URLs and API requests. Only lowercase letters, numbers, and hyphens."
        required
      />

      {error && (
        <div className="p-4 rounded bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="pt-4">
        <Button
          type="submit"
          label={isLoading ? "Creating..." : "Create Organization"}
          disabled={isLoading || !name || !slug}
        />
      </div>
    </form>
  );
}
