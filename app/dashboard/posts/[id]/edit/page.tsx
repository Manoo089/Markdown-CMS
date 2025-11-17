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

  // Nicht der Author → Könnte man auch anders handhaben
  if (post.authorId !== session.user.id) {
    notFound(); // oder redirect zu Dashboard mit Error
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <p className="text-gray-600 mt-2">Update your content</p>
        </div>
        <EditPostForm post={post} />
      </div>
    </div>
  );
}
