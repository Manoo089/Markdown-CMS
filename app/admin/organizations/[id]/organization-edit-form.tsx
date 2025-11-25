"use client";

import { useState } from "react";
import { updateOrganization } from "./actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";

interface Props {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export function OrganizationEditForm({ organization }: Props) {
  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const result = await updateOrganization(organization.id, { name, slug });

    setIsLoading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({
        type: "success",
        text: "Organization updated successfully!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        id="organization_name"
        type="text"
        label="Organization Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Acme Inc."
        required
      />

      <InputField
        id="slug"
        type="text"
        label="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="acme-inc"
        description="Used in URLs and API requests"
        required
      />

      {message && (
        <div
          className={`p-4 rounded ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button
        type="submit"
        label={isLoading ? "Saving..." : "Save Changes"}
        disabled={isLoading}
      />
    </form>
  );
}
