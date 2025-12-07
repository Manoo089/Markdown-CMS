import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags",
};

export default function TagsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tags</h1>
        <p className="text-text-muted mt-2">
          Add tags to your posts for better discoverability
        </p>
      </div>

      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <p className="text-text-muted">Tags feature coming soon...</p>
      </div>
    </>
  );
}
