"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/slug-utils";
import { useMessage } from "@/hooks/useActionState";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { MessageAlert } from "@/components/MessageAlert";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import TextareaField from "@/ui/TextareaField";
import CheckboxField from "@/ui/CheckboxField";
import SelectField from "@/ui/SelectField";
import {
  isSuccess,
  isError,
  getErrorMessage,
  ActionResult,
} from "@/lib/errors";
import { ContentTypeDefinition } from "@/types/content-type";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Category option for the select field
 */
export interface CategoryOption {
  id: string;
  name: string;
  parentName?: string | null;
}

/**
 * Tag option for the multi-select
 */
export interface TagOption {
  id: string;
  name: string;
}

/**
 * Post data structure for editing
 */
export interface PostData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  type: string;
  published: boolean;
  categoryId: string | null;
  tags?: { id: string }[];
}

/**
 * Props for the PostEditor component
 */
interface PostEditorProps {
  /** Mode determines button labels and initial state behavior */
  mode: "create" | "edit";
  /** Initial post data - required for edit mode, optional for create */
  initialData?: PostData;
  /** Available content types from organization config */
  contentTypeOptions: ContentTypeDefinition[];
  /** Available categories for selection */
  categoryOptions?: CategoryOption[];
  /** Available tags for selection */
  tagOptions?: TagOption[];
  /** Server action to call on submit */
  onSubmit: (data: PostFormData) => Promise<ActionResult<{ postId: string }>>;
}

/**
 * Data structure passed to the submit action
 */
export interface PostFormData {
  postId?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  type: string;
  published: boolean;
  categoryId?: string | null;
  tagIds?: string[];
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_POST_DATA: PostData = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  type: "post",
  published: false,
  categoryId: null,
  tags: [],
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Unified Post Editor component for creating and editing posts
 *
 * @example
 * // Create mode
 * <PostEditor
 *   mode="create"
 *   contentTypeOptions={config.types}
 *   categoryOptions={categories}
 *   onSubmit={createPost}
 * />
 *
 * @example
 * // Edit mode
 * <PostEditor
 *   mode="edit"
 *   initialData={post}
 *   contentTypeOptions={config.types}
 *   categoryOptions={categories}
 *   onSubmit={(data) => updatePost({ ...data, postId: post.id })}
 * />
 */
export function PostEditor({
  mode,
  initialData,
  contentTypeOptions,
  categoryOptions = [],
  tagOptions = [],
  onSubmit,
}: PostEditorProps) {
  const router = useRouter();

  // Merge initial data with defaults
  const initial = { ...DEFAULT_POST_DATA, ...initialData };

  // Form state
  const [title, setTitle] = useState(initial.title);
  const [manualSlug, setManualSlug] = useState(initial.slug);
  const [content, setContent] = useState(initial.content);
  const [excerpt, setExcerpt] = useState(initial.excerpt || "");
  const [type, setType] = useState(initial.type);
  const [published, setPublished] = useState(initial.published);
  const [categoryId, setCategoryId] = useState(initial.categoryId || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initial.tags?.map((t) => t.id) || [],
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Message handling
  const { message, showError, clearMessage } = useMessage();

  // Computed slug (auto-generate from title if not manually set)
  const slug = manualSlug || generateSlug(title);

  // Category options for SelectField
  const categorySelectOptions = [
    { value: "", label: "No Category" },
    ...categoryOptions.map((c) => ({
      value: c.id,
      label: c.parentName ? `${c.parentName} → ${c.name}` : c.name,
    })),
  ];

  // Mode-specific labels
  const labels = {
    create: {
      submit: "Save Post",
      submitting: "Saving...",
    },
    edit: {
      submit: "Update Post",
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

    const formData: PostFormData = {
      title,
      slug,
      content,
      excerpt: excerpt || undefined,
      type,
      published,
      categoryId: categoryId || null,
      tagIds: selectedTagIds,
    };

    // Include postId for edit mode
    if (mode === "edit" && initialData?.id) {
      formData.postId = initialData.id;
    }

    const result = await onSubmit(formData);

    if (isError(result)) {
      const errorMessage = getErrorMessage(result);
      if (errorMessage) {
        showError(errorMessage);
      }
      setIsSubmitting(false);
      return;
    }

    if (isSuccess(result)) {
      router.push("/");
      router.refresh();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-lg shadow p-6 space-y-6 border border-border"
    >
      {/* Title Field */}
      <InputField
        id="title"
        type="text"
        label="Title"
        value={title}
        placeholder="Enter post title"
        fullWidth
        required
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Slug Field */}
      <InputField
        id="slug"
        type="text"
        label="Slug"
        value={slug}
        placeholder="post-url-slug"
        fullWidth
        required
        advancedLabel="(auto-generated, but editable)"
        onChange={(e) => setManualSlug(e.target.value)}
      />

      {/* Content Type and Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Content Type Select */}
        <SelectField
          id="type"
          label="Content Type"
          options={contentTypeOptions}
          value={type}
          fullWidth
          onChange={(e) => setType(e.target.value)}
        />

        {/* Category Select */}
        {categoryOptions.length > 0 && (
          <SelectField
            id="categoryId"
            label="Category"
            options={categorySelectOptions}
            value={categoryId}
            fullWidth
            onChange={(e) => setCategoryId(e.target.value)}
          />
        )}
      </div>

      {/* Tags Multi-Select */}
      {tagOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-surface min-h-[42px]">
            {tagOptions.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTagIds((prev) =>
                      isSelected
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id],
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-surface-hover text-text-muted hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {tag.name}
                  {isSelected && <span className="ml-1">×</span>}
                </button>
              );
            })}
          </div>
          {selectedTagIds.length > 0 && (
            <p className="mt-1 text-xs text-text-muted">
              {selectedTagIds.length} tag{selectedTagIds.length !== 1 && "s"}{" "}
              selected
            </p>
          )}
        </div>
      )}

      {/* Excerpt Field */}
      <TextareaField
        id="excerpt"
        label="Excerpt (Optional)"
        value={excerpt}
        placeholder="Short description..."
        rows={3}
        fullWidth
        advancedLabel="(auto-generated, but editable)"
        onChange={(e) => setExcerpt(e.target.value)}
      />

      {/* Markdown Content with Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-text">
            Content (Markdown)
          </label>
          <Button
            type="button"
            label={showPreview ? "Hide Preview" : "Show Preview"}
            onClick={() => setShowPreview(!showPreview)}
            variant="plain"
            className="text-sm text-primary hover:text-primary-hover font-medium"
          />
        </div>
        <div
          className={`grid gap-4 ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <TextareaField
            id="content"
            label=""
            value={content}
            placeholder="# Your markdown content here..."
            rows={20}
            fullWidth
            isMarkdown
            onChange={(e) => setContent(e.target.value)}
          />

          {showPreview && (
            <div className="border border-border rounded-md p-4 bg-surface overflow-auto max-h-[500px]">
              <MarkdownPreview content={content} />
            </div>
          )}
        </div>
      </div>

      {/* Published Checkbox */}
      <CheckboxField
        id="published"
        checked={published}
        label="Publish immediately"
        onChange={(e) => setPublished(e.target.checked)}
      />

      {/* Error/Success Message */}
      <MessageAlert message={message} onDismiss={clearMessage} />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          label={isSubmitting ? labels[mode].submitting : labels[mode].submit}
        />

        <Button
          type="button"
          label="Cancel"
          onClick={() => router.push("/")}
          variant="outline"
          color="secondary"
        />
      </div>
    </form>
  );
}
