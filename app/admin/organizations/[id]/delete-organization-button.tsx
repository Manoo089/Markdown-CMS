"use client";

import { useState } from "react";
import { deleteOrganization } from "./actions";
import { useRouter } from "next/navigation";
import Button from "@/ui/Button";
import { useActionState } from "@/hooks/useActionState";
import { MessageAlert } from "@/components/MessageAlert";

interface Props {
  organizationId: string;
  organizationName: string;
}

export function DeleteOrganizationButton({
  organizationId,
  organizationName,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const router = useRouter();
  const deleteAction = useActionState<string, void>();

  const handleDelete = async () => {
    if (confirmText !== organizationName) {
      return;
    }

    await deleteAction.execute(deleteOrganization, organizationId, {
      successMessage: "Organization deleted successfully!",
      onSuccess: () => {
        // Redirect to organizations list
        router.push("/admin/organizations");
      },
    });
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setConfirmText("");
    deleteAction.clearErrors();
  };

  if (!showConfirm) {
    return (
      <Button
        type="button"
        onClick={() => setShowConfirm(true)}
        label="Delete Organization"
        variant="solid"
        className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/50"
      />
    );
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800 space-y-4">
      <MessageAlert
        message={deleteAction.message}
        onDismiss={deleteAction.clearErrors}
      />

      <div>
        <h4 className="font-bold text-red-800 dark:text-red-200 mb-2">
          ⚠️ Delete Organization
        </h4>
        <p className="text-sm text-red-700 dark:text-red-300 mb-2">
          This will permanently delete the organization, all its users, posts,
          API keys, and settings. This action cannot be undone.
        </p>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          Type <span className="font-mono font-bold">{organizationName}</span>{" "}
          to confirm:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={organizationName}
          className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded bg-white dark:bg-gray-900 text-text"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleDelete}
          label={deleteAction.isLoading ? "Deleting..." : "Confirm Delete"}
          disabled={confirmText !== organizationName || deleteAction.isLoading}
          className="bg-red-600 hover:bg-red-700 text-white"
        />
        <Button
          type="button"
          onClick={handleCancel}
          label="Cancel"
          variant="solid"
        />
      </div>
    </div>
  );
}
