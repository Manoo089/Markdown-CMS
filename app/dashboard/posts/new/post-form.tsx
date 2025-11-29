"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "./actions";
import { generateSlug } from "@/lib/slug-utils";
import { contentTypeOptions } from "@/lib/constants/content-type-options";
import { useMessage } from "@/hooks/useActionState";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { MessageAlert } from "@/components/MessageAlert";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import TextareaField from "@/ui/TextareaField";
import CheckboxField from "@/ui/CheckboxField";
import SelectField from "@/ui/SelectField";
import { isSuccess, isError, getErrorMessage } from "@/lib/errors";

interface Props {
  userId: string;
  organizationId: string;
}

export function PostForm({ userId, organizationId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [manualSlug, setManualSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [type, setType] = useState("post");
  const [published, setPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const { message, showError, clearMessage } = useMessage();
  const slug = manualSlug || generateSlug(title);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearMessage();

    const result = await createPost({
      title,
      slug,
      content,
      excerpt: excerpt || undefined,
      type,
      published,
      authorId: userId,
      organizationId,
    });

    if (isError(result)) {
      const errorMessage = getErrorMessage(result);
      if (errorMessage) {
        showError(errorMessage);
      }
      setIsSubmitting(false);
      return;
    }

    if (isSuccess(result)) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-lg shadow p-6 space-y-6 border border-border"
    >
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

      <SelectField
        id="type"
        label="Content Type"
        options={contentTypeOptions}
        value={type}
        fullWidth
        onChange={(e) => setType(e.target.value)}
      />

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

      <CheckboxField
        id="pusblished"
        checked={published}
        label="Publish immediately"
        onChange={(e) => setPublished(e.target.checked)}
      />

      <MessageAlert message={message} onDismiss={clearMessage} />

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          label={isSubmitting ? "Saving..." : "Save Post"}
        />

        <Button
          type="button"
          label="Cancel"
          onClick={() => router.push("/dashboard")}
          variant="outline"
          color="secondary"
        />
      </div>
    </form>
  );
}
