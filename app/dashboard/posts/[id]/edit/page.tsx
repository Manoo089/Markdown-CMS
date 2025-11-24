import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditPostForm } from "./edit-post-form";

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <p className="text-text-subtle mt-2">Update your content</p>
        </div>
        <EditPostForm post={post} organizationId={session.user.organizationId} />
      </div>
    </div>
  );
}
