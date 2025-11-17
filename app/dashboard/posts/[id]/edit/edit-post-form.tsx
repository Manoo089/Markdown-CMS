"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updatePost } from "./actions";
import { generateSlug } from "@/lib/slug-utils";

interface Props {
  post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    published: boolean;
  };
}

export function EditPostForm({ post }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState<string>(post.title);
  const [manualSlug, setManualSlug] = useState(post.slug);
  const [content, setContent] = useState<string>(post.content);
  const [excerpt, setExcerpt] = useState(post.excerpt || "");
  const [published, setPublished] = useState<boolean>(post.published);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState("");

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
      published,
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
    <form className="flex flex-col text-black gap-3" onSubmit={handleSubmit}>
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        type="text"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titel"
        required
      />
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        type="text"
        name="slug"
        value={slug}
        onChange={(e) => setManualSlug(e.target.value)}
        placeholder="Slug"
        required
      />
      <textarea
        className="w-full px-4 py-2 border border-gray-300 rounded-md font-mono"
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Inhalt (Markdown)"
        required
        rows={15}
      />
      <textarea
        className="w-full px-4 py-2 border border-gray-300 rounded-md font-mono"
        name="excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Auszug (optional)"
      />

      <label htmlFor="published">
        Published
        <input
          className="ml-4"
          type="checkbox"
          name="published"
          checked={published}
          onChange={() => setPublished(!published)}
        />
      </label>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Update Post"}
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
