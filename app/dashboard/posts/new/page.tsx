import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { createPost } from "./actions";
import { parseContentTypeConfig } from "@/lib/utils";
import Button from "@/ui/Button";
import Navigation from "@/components/Navigation";
import { PostEditor } from "@/components/PostEditor";

export const metadata: Metadata = {
  title: "Create new post",
};

export default async function NewPostPage() {
  const session = await requireAuth();

  // Get organization's content type configuration
  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { contentTypeConfig: true },
  });

  const config = parseContentTypeConfig(org?.contentTypeConfig);

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
        <PostEditor
          mode="create"
          contentTypeOptions={config.types}
          onSubmit={createPost}
        />
      </div>
    </div>
  );
}
