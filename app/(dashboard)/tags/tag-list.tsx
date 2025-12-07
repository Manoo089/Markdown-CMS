"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Tag, deleteTag } from "./actions";
import { TagForm, type TagData } from "./tag-form";
import { isSuccess, getErrorMessage } from "@/lib/errors";

interface TagListProps {
  tags: Tag[];
}

export function TagList({ tags }: TagListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    setDeletingId(id);
    const result = await deleteTag({ tagId: id });
    setDeletingId(null);

    if (!isSuccess(result)) {
      alert(getErrorMessage(result) || "Failed to delete tag");
    } else {
      router.refresh();
    }
  };

  const handleEditSuccess = () => {
    setEditingId(null);
  };

  // Convert Tag to TagData for the form
  const toTagData = (tag: Tag): TagData => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  });

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No tags yet. Create your first tag above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tags.map((tag) => {
        const isEditing = editingId === tag.id;
        const isDeleting = deletingId === tag.id;

        return (
          <div
            key={tag.id}
            className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg"
          >
            {isEditing ? (
              <div className="flex-1">
                <TagForm
                  mode="edit"
                  initialData={toTagData(tag)}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text">{tag.name}</span>
                    <span className="text-xs text-text-muted">/{tag.slug}</span>
                  </div>
                  <div className="mt-1 text-xs text-text-muted">
                    {tag._count.posts} posts
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(tag.id)}
                    className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    disabled={isDeleting}
                    className="px-3 py-1 text-sm text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "..." : "Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
