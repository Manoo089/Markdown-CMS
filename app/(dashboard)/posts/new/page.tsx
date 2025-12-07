import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/PostEditor";
import { createPost } from "./actions";
import { getContentTypeConfig } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create new post",
};

export default async function NewPostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get organization's content type configuration (cached)
  const config = await getContentTypeConfig(session.user.organizationId);

  // Get categories for this organization
  const categories = await prisma.category.findMany({
    where: { organizationId: session.user.organizationId },
    include: { parent: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  // Get tags for this organization
  const tags = await prisma.tag.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { name: "asc" },
  });

  // Transform to CategoryOption format
  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.name,
    parentName: c.parent?.name || null,
  }));

  // Transform to TagOption format
  const tagOptions = tags.map((t) => ({
    id: t.id,
    name: t.name,
  }));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-text-subtle mt-2">Write your content in Markdown</p>
      </div>
      <PostEditor
        mode="create"
        contentTypeOptions={config.types}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        onSubmit={createPost}
      />
    </>
  );
}
