"use client";

import { useState } from "react";
import { type Tag } from "./actions";
import { TagForm } from "./tag-form";
import { TagList } from "./tag-list";
import Button from "@/ui/Button";

interface TagsClientProps {
  initialTags: Tag[];
}

export function TagsClient({ initialTags }: TagsClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-text-muted mt-1">
            Add tags to your posts for better organization
          </p>
        </div>
        {!showForm && (
          <Button
            type="button"
            label="+ New Tag"
            onClick={() => setShowForm(true)}
          />
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-surface border border-border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Create New Tag</h2>
          <TagForm
            mode="create"
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Tag List */}
      <TagList tags={initialTags} />
    </>
  );
}
