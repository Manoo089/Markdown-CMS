import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-text-subtle mt-2">Write your content in Markdown</p>
      </div>
      <PostEditor
        mode="create"
        contentTypeOptions={config.types}
        onSubmit={createPost}
      />
    </>
  );
}
