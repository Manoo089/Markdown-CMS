"use client";

import { useState } from "react";
import { deleteOrganization } from "./actions";
import { useRouter } from "next/navigation";
import Button from "@/ui/Button";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== organizationName) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteOrganization(organizationId);

    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      router.push("/admin/organizations");
    }
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
          label={isDeleting ? "Deleting..." : "Confirm Delete"}
          disabled={confirmText !== organizationName || isDeleting}
          className="bg-red-600 hover:bg-red-700 text-white"
        />
        <Button
          type="button"
          onClick={() => {
            setShowConfirm(false);
            setConfirmText("");
          }}
          label="Cancel"
          variant="solid"
        />
      </div>
    </div>
  );
}
