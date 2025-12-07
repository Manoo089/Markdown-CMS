import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getContentTypeConfig } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";
import { PostEditor } from "@/components/PostEditor";
import { updatePost } from "./actions";

export const metadata: Metadata = {
  title: "Edit post",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

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

  // Get organization's content type configuration (cached)
  const config = await getContentTypeConfig(session.user.organizationId);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-text-subtle mt-2">Update your content</p>
      </div>
      <PostEditor
        mode="edit"
        initialData={post}
        contentTypeOptions={config.types}
        onSubmit={updatePost}
      />
    </>
  );
}
