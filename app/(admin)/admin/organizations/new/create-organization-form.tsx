"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "./actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import { useActionState } from "@/hooks/useActionState";
import { FieldError, MessageAlert } from "@/components/MessageAlert";

export function CreateOrganizationForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const router = useRouter();

  const createAction = useActionState<{ name: string; slug: string }, string>();

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

    await createAction.execute(
      createOrganization,
      { name, slug },
      {
        successMessage: "Organization created successfully!",
        onSuccess: (organizationId: string) => {
          // Redirect to organization detail page
          router.push(`/admin/organizations/${organizationId}`);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MessageAlert
        message={createAction.message}
        onDismiss={createAction.clearErrors}
      />

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
      <FieldError error={createAction.fieldErrors.name} />

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
      <FieldError error={createAction.fieldErrors.slug} />

      <div className="pt-4">
        <Button
          type="submit"
          label={createAction.isLoading ? "Creating..." : "Create Organization"}
          disabled={createAction.isLoading || !name || !slug}
        />
      </div>
    </form>
  );
}
