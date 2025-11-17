"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "./actions";
import { generateSlug } from "@/lib/slug-utils";
import { MarkdownPreview } from "@/components/MarkdownPreview";

interface Props {
  userId: string;
}

export function PostForm({ userId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [manualSlug, setManualSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [published, setPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const slug = manualSlug || generateSlug(title);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await createPost({
      title,
      slug,
      content,
      excerpt: excerpt || undefined,
      published,
      authorId: userId,
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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
          Slug
          <span className="text-gray-500 text-xs ml-2">(auto-generated, but editable)</span>
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => setManualSlug(e.target.value)}
          placeholder="post-url-slug"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
          Excerpt (Optional)
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short description..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Content (Markdown)</label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>

        <div className={`grid gap-4 ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}>
          <div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Your markdown content here..."
              required
              rows={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

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
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
