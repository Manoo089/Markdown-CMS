"use client";

import { useState } from "react";
import { type Category } from "./actions";
import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";
import Button from "@/ui/Button";

interface CategoriesClientProps {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-text-muted mt-1">
            Organize your blog posts into categories
          </p>
        </div>
        {!showForm && (
          <Button
            type="button"
            label="+ New Category"
            onClick={() => setShowForm(true)}
          />
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-surface border border-border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Create New Category</h2>
          <CategoryForm
            mode="create"
            categories={initialCategories}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Category List */}
      <CategoryList categories={initialCategories} />
    </>
  );
}
