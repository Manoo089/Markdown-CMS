"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateSlug } from "@/lib/slug-utils";
import { updatePost } from "./actions";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";

interface Props {
  post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    type: string;
    published: boolean;
  };
  organizationId: string;
}

export function EditPostForm({ post, organizationId }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(post.title);
  const [manualSlug, setManualSlug] = useState(post.slug);
  const [content, setContent] = useState(post.content);
  const [excerpt, setExcerpt] = useState(post.excerpt || "");
  const [type, setType] = useState(post.type);
  const [published, setPublished] = useState(post.published);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const slug = manualSlug || generateSlug(title);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await updatePost({
      postId: post.id,
      title,
      slug,
      content,
      excerpt: excerpt || undefined,
      type,
      published,
      organizationId,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form className="bg-white rounded-lg shadow p-6 space-y-6" onSubmit={handleSubmit}>
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

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          Content Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="post">Blog Post</option>
          <option value="page">Page</option>
          <option value="service">Service</option>
        </select>
      </div>

      <InputField
        id="excerpt"
        type="textarea"
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
          <label className="block text-sm font-medium text-gray-700">Content (Markdown)</label>
          <Button
            type="button"
            label={showPreview ? "Hide Preview" : "Show Preview"}
            onClick={() => setShowPreview(!showPreview)}
            variant="plain"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          />
        </div>
        <div className={`grid gap-4 ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}>
          <InputField
            id="content"
            type="textarea"
            label=""
            value={content}
            placeholder="# Your markdown content here..."
            rows={20}
            fullWidth
            isMarkdown
            onChange={(e) => setContent(e.target.value)}
          />

          {showPreview && (
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50 overflow-auto max-h-[500px]">
              <MarkdownPreview content={content} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
          Publish immediately
        </label>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" label={isSubmitting ? "Updating..." : "Update Post"} disabled={isSubmitting} />
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
