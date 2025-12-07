"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Category, deleteCategory } from "./actions";
import { CategoryForm, type CategoryData } from "./category-form";
import { isSuccess, getErrorMessage } from "@/lib/errors";

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Build tree structure for display
  const rootCategories = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setDeletingId(id);
    const result = await deleteCategory({ categoryId: id });
    setDeletingId(null);

    if (!isSuccess(result)) {
      alert(getErrorMessage(result) || "Failed to delete category");
    } else {
      router.refresh();
    }
  };

  const handleEditSuccess = () => {
    setEditingId(null);
  };

  // Convert Category to CategoryData for the form
  const toCategoryData = (category: Category): CategoryData => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
  });

  const renderCategory = (category: Category, level: number = 0) => {
    const children = getChildren(category.id);
    const isEditing = editingId === category.id;
    const isDeleting = deletingId === category.id;

    return (
      <div key={category.id}>
        <div
          className={`flex items-center justify-between p-3 bg-surface border border-border rounded-lg ${
            level > 0 ? "ml-6" : ""
          }`}
        >
          {isEditing ? (
            <div className="flex-1">
              <CategoryForm
                mode="edit"
                initialData={toCategoryData(category)}
                categories={categories}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text">{category.name}</span>
                  <span className="text-xs text-text-muted">
                    /{category.slug}
                  </span>
                </div>
                {category.description && (
                  <p className="text-sm text-text-muted mt-1">
                    {category.description}
                  </p>
                )}
                <div className="flex gap-4 mt-1 text-xs text-text-muted">
                  <span>{category._count.posts} posts</span>
                  {category._count.children > 0 && (
                    <span>{category._count.children} subcategories</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingId(category.id)}
                  className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  disabled={isDeleting}
                  className="px-3 py-1 text-sm text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "..." : "Delete"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Render children */}
        {children.length > 0 && (
          <div className="mt-2 space-y-2">
            {children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No categories yet. Create your first category above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rootCategories.map((category) => renderCategory(category))}
    </div>
  );
}
