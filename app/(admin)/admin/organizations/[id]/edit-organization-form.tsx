"use client";

import { useState } from "react";
import { updateOrganization } from "./actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import { useActionState } from "@/hooks/useActionState";
import { MessageAlert, FieldError } from "@/components/MessageAlert";

interface Props {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export function EditOrganizationForm({ organization }: Props) {
  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);

  const updateAction = useActionState<
    { organizationId: string; name: string; slug: string },
    void
  >();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateAction.execute(
      updateOrganization,
      {
        organizationId: organization.id,
        name,
        slug,
      },
      {
        successMessage: "Organization updated successfully!",
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MessageAlert
        message={updateAction.message}
        onDismiss={updateAction.clearErrors}
      />

      <InputField
        id="organization_name"
        type="text"
        label="Organization Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Acme Inc."
        required
      />
      <FieldError error={updateAction.fieldErrors.name} />

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
      <FieldError error={updateAction.fieldErrors.slug} />

      <Button
        type="submit"
        label={updateAction.isLoading ? "Saving..." : "Save Changes"}
        disabled={updateAction.isLoading}
      />
    </form>
  );
}
