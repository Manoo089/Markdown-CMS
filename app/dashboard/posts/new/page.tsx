import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { PostForm } from "./post-form";
import Button from "@/ui/Button";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Create new post",
};

export default async function NewPostPage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation>
        <div className="flex items-center gap-4">
          <Button
            href="/dashboard"
            label="← Back to Dashboard"
            variant="plain"
            color="secondary"
          />
        </div>
      </Navigation>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <p className="text-text-subtle mt-2">
            Write your content in Markdown
          </p>
        </div>
        <PostForm
          userId={session?.user?.id}
          organizationId={session.user.organizationId}
        />
      </div>
    </div>
  );
}
