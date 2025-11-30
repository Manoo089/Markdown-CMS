import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { parseContentTypeConfig } from "@/lib/utils";
import { notFound } from "next/navigation";
import { EditPostForm } from "./edit-post-form";
import Navigation from "@/components/Navigation";
import Button from "@/ui/Button";

export const metadata: Metadata = {
  title: "Edit post",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const session = await requireAuth();
  const { id } = await params;

  // Post aus DB holen
  const post = await prisma.post.findUnique({
    where: { id },
  });

  // Post existiert nicht → 404
  if (!post) {
    notFound();
  }

  // Post gehört nicht zur Organization des Users → 404
  if (post.organizationId !== session.user.organizationId) {
    notFound();
  }

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
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <p className="text-text-subtle mt-2">Update your content</p>
        </div>
        <EditPostForm
          post={post}
          organizationId={session.user.organizationId}
          contentTypeOptions={config.types}
        />
      </div>
    </div>
  );
}
