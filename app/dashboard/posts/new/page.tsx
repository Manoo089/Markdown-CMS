import { requireAuth } from "@/lib/auth-utils";
import { PostForm } from "./post-form";

export default async function NewPostPage() {
  const session = await requireAuth();

  console.log("Session user:", session.user); // ← Debug

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <p className="text-gray-600 mt-2">Write your content in Markdown</p>
        </div>
        <PostForm userId={session?.user?.id} />
      </div>
    </div>
  );
}
