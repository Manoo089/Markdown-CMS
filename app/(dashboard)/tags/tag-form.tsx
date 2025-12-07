"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import { MessageAlert } from "@/components/MessageAlert";
import { useMessage } from "@/hooks/useActionState";
import { createTag, updateTag } from "./actions";
import { isSuccess, isError, getErrorMessage } from "@/lib/errors";
import { generateSlug } from "@/lib/slug-utils";

// ============================================================================
// TYPES
// ============================================================================

export interface TagData {
  id?: string;
  name: string;
  slug: string;
}

interface TagFormProps {
  /** Mode determines button labels and behavior */
  mode: "create" | "edit";
  /** Initial data - required for edit mode */
  initialData?: TagData;
  /** Callback after successful save */
  onSuccess?: () => void;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_TAG_DATA: TagData = {
  name: "",
  slug: "",
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Unified Tag Form component for creating and editing tags
 *
 * @example
 * // Create mode
 * <TagForm
 *   mode="create"
 *   onSuccess={() => setShowForm(false)}
 *   onCancel={() => setShowForm(false)}
 * />
 *
 * @example
 * // Edit mode
 * <TagForm
 *   mode="edit"
 *   initialData={tag}
 *   onSuccess={() => setEditingId(null)}
 *   onCancel={() => setEditingId(null)}
 * />
 */
export function TagForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: TagFormProps) {
  const router = useRouter();

  // Merge initial data with defaults
  const initial = { ...DEFAULT_TAG_DATA, ...initialData };

  // Form state
  const [name, setName] = useState(initial.name);
  const [manualSlug, setManualSlug] = useState(initial.slug);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Message handling
  const { message, showError, clearMessage } = useMessage();

  // Computed slug (auto-generate from name if not manually set)
  const slug = manualSlug || generateSlug(name);

  // Mode-specific labels
  const labels = {
    create: {
      submit: "Create Tag",
      submitting: "Creating...",
    },
    edit: {
      submit: "Update Tag",
      submitting: "Updating...",
    },
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearMessage();

    const formData = {
      name,
      slug,
      ...(mode === "edit" && initialData?.id && { tagId: initialData.id }),
    };

    const result =
      mode === "edit" ? await updateTag(formData) : await createTag(formData);

    if (isError(result)) {
      const errorMessage = getErrorMessage(result);
      if (errorMessage) {
        showError(errorMessage);
      }
      setIsSubmitting(false);
      return;
    }

    if (isSuccess(result)) {
      router.refresh();
      onSuccess?.();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Field */}
      <InputField
        id="name"
        type="text"
        label="Name"
        value={name}
        placeholder="e.g. JavaScript"
        fullWidth
        required
        onChange={(e) => setName(e.target.value)}
      />

      {/* Slug Field */}
      <InputField
        id="slug"
        type="text"
        label="Slug"
        value={slug}
        placeholder="e.g. javascript"
        fullWidth
        required
        advancedLabel="(auto-generated, but editable)"
        onChange={(e) => setManualSlug(e.target.value)}
      />

      {/* Error/Success Message */}
      <MessageAlert message={message} onDismiss={clearMessage} />

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          label={isSubmitting ? labels[mode].submitting : labels[mode].submit}
        />
        {onCancel && (
          <Button
            type="button"
            label="Cancel"
            variant="outline"
            onClick={onCancel}
          />
        )}
      </div>
    </form>
  );
}
