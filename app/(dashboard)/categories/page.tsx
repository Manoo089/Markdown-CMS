import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-text-muted mt-2">
          Organize your blog posts into categories
        </p>
      </div>

      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <p className="text-text-muted">Categories feature coming soon...</p>
      </div>
    </>
  );
}
