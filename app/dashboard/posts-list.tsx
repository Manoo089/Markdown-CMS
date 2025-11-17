import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { DeleteButton } from "./delete-button";
import { POSTS_PER_PAGE } from "@/lib/constants";

interface Props {
  page?: number;
}

export async function PostsList({ page = 1 }: Props) {
  const totalPosts = await prisma.post.count();
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
    skip: (page - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  });

  if (totalPosts === 0) {
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
        <h2 className="text-2xl font-bold">Your Posts ({totalPosts})</h2>
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

                  {/* Type Badge */}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      post.type === "service"
                        ? "bg-purple-100 text-purple-800"
                        : post.type === "page"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {post.type}
                  </span>

                  <span>•</span>

                  {/* Published/Draft Badge */}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex gap-3">
                <Link
                  href={`/dashboard/posts/${post.id}/edit`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </Link>
                <DeleteButton postId={post.id} postTitle={post.title} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Link
            href={`/dashboard?page=${page - 1}`}
            className={`px-4 py-2 border rounded-md ${
              page <= 1
                ? "pointer-events-none opacity-50 bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            aria-disabled={page <= 1}
          >
            Previous
          </Link>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <Link
            href={`/dashboard?page=${page + 1}`}
            className={`px-4 py-2 border rounded-md ${
              page >= totalPages
                ? "pointer-events-none opacity-50 bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            aria-disabled={page >= totalPages}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
