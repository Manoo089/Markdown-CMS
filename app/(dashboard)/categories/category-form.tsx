"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import TextareaField from "@/ui/TextareaField";
import SelectField from "@/ui/SelectField";
import { MessageAlert } from "@/components/MessageAlert";
import { useMessage } from "@/hooks/useActionState";
import { createCategory, updateCategory, type Category } from "./actions";
import { isSuccess, isError, getErrorMessage } from "@/lib/errors";
import { generateSlug } from "@/lib/slug-utils";

// ============================================================================
// TYPES
// ============================================================================

export interface CategoryData {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
}

interface CategoryFormProps {
  /** Mode determines button labels and behavior */
  mode: "create" | "edit";
  /** Initial data - required for edit mode */
  initialData?: CategoryData;
  /** Available parent categories */
  categories: Category[];
  /** Callback after successful save */
  onSuccess?: () => void;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_CATEGORY_DATA: CategoryData = {
  name: "",
  slug: "",
  description: "",
  parentId: null,
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Unified Category Form component for creating and editing categories
 *
 * @example
 * // Create mode
 * <CategoryForm
 *   mode="create"
 *   categories={categories}
 *   onSuccess={() => setShowForm(false)}
 *   onCancel={() => setShowForm(false)}
 * />
 *
 * @example
 * // Edit mode
 * <CategoryForm
 *   mode="edit"
 *   initialData={category}
 *   categories={categories}
 *   onSuccess={() => setEditingId(null)}
 *   onCancel={() => setEditingId(null)}
 * />
 */
export function CategoryForm({
  mode,
  initialData,
  categories,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const router = useRouter();

  // Merge initial data with defaults
  const initial = { ...DEFAULT_CATEGORY_DATA, ...initialData };

  // Form state
  const [name, setName] = useState(initial.name);
  const [manualSlug, setManualSlug] = useState(initial.slug);
  const [description, setDescription] = useState(initial.description || "");
  const [parentId, setParentId] = useState(initial.parentId || "");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Message handling
  const { message, showError, clearMessage } = useMessage();

  // Computed slug (auto-generate from name if not manually set)
  const slug = manualSlug || generateSlug(name);

  // Filter out the current category and its descendants for parent selection
  const availableParents = categories.filter((c) => {
    if (!initialData?.id) return true;
    if (c.id === initialData.id) return false;
    return !isDescendantOf(c.id, initialData.id, categories);
  });

  // Parent options for SelectField
  const parentOptions = [
    { value: "", label: "None (Top Level)" },
    ...availableParents.map((c) => ({
      value: c.id,
      label: c.parent ? `${c.parent.name} → ${c.name}` : c.name,
    })),
  ];

  // Mode-specific labels
  const labels = {
    create: {
      submit: "Create Category",
      submitting: "Creating...",
    },
    edit: {
      submit: "Update Category",
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
      description: description || undefined,
      parentId: parentId || null,
      ...(mode === "edit" && initialData?.id && { categoryId: initialData.id }),
    };

    const result =
      mode === "edit"
        ? await updateCategory(formData)
        : await createCategory(formData);

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
        placeholder="e.g. Technology"
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
        placeholder="e.g. technology"
        fullWidth
        required
        advancedLabel="(auto-generated, but editable)"
        onChange={(e) => setManualSlug(e.target.value)}
      />

      {/* Description Field */}
      <TextareaField
        id="description"
        label="Description (Optional)"
        value={description}
        placeholder="Optional description"
        rows={2}
        fullWidth
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Parent Category Select */}
      <SelectField
        id="parentId"
        label="Parent Category"
        options={parentOptions}
        value={parentId}
        fullWidth
        onChange={(e) => setParentId(e.target.value)}
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if categoryId is a descendant of ancestorId
 */
function isDescendantOf(
  categoryId: string,
  ancestorId: string,
  categories: Category[],
): boolean {
  const category = categories.find((c) => c.id === categoryId);
  if (!category || !category.parentId) return false;
  if (category.parentId === ancestorId) return true;
  return isDescendantOf(category.parentId, ancestorId, categories);
}
