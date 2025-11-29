"use client";

import { useState } from "react";
import { deletePost } from "./actions";
import { useRouter } from "next/navigation";
import { isError, getErrorMessage } from "@/lib/errors";
import Button from "@/ui/Button";

interface Props {
  postId: string;
  postTitle: string;
}

export function DeleteButton({ postId, postTitle }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Confirmation Dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);

    const result = await deletePost(postId);

    if (isError(result)) {
      const errorMessage = getErrorMessage(result);
      if (errorMessage) {
        alert(errorMessage);
      }
      setIsDeleting(false);
      return;
    }

    // Erfolg - refresh
    router.refresh();
  };

  return (
    <Button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      label={isDeleting ? "Deleting..." : "Delete"}
      variant="plain"
      color="danger"
      className="text-sm"
    />
  );
}
