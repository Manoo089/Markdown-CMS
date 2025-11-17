import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function PostsList() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No posts yet. Create your first post!</p>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Posts</h2>
        <Link href="/dashboard/posts/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          New Post
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {posts.map((post) => (
          <div key={post.id} className="p-6 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
                {post.excerpt && <p className="text-gray-600 text-sm mb-2">{post.excerpt}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>By {post.author.name || post.author.email}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <Link
                href={`/dashboard/posts/${post.id}/edit`}
                className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
