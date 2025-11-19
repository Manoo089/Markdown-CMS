import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { DeleteButton } from "./delete-button";
import { HighlightText } from "./highlight-text";
import { POSTS_PER_PAGE } from "@/lib/constants";
import Button from "@/ui/Button";

interface Props {
  page?: number;
  status?: string;
  type?: string;
  search?: string;
  organizationId: string;
}

export async function PostsList({ page = 1, status = "all", type = "all", search = "", organizationId }: Props) {
  const where: Prisma.PostWhereInput = {
    organizationId,
  };

  // Status-Filter
  if (status === "published") {
    where.published = true;
  } else if (status === "draft") {
    where.published = false;
  }

  // Type-Filter
  if (type !== "all") {
    where.type = type;
  }

  // Search-Filter
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  const totalPosts = await prisma.post.count({ where });
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const posts = await prisma.post.findMany({
    where,
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
        <p className="text-gray-500 mb-4">
          {status === "all" && type === "all"
            ? "No posts yet. Create your first post!"
            : "No posts match your filters."}
        </p>
        <Button href="/dashboard/posts/new" label="Create Post" />
      </div>
    );
  }

  // Aktuelle Filter für Pagination-Links beibehalten
  const filterParams = new URLSearchParams();
  if (status !== "all") filterParams.set("status", status);
  if (type !== "all") filterParams.set("type", type);
  const filterQuery = filterParams.toString();
  const filterSuffix = filterQuery ? `&${filterQuery}` : "";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Posts ({totalPosts})</h2>
        <Button href="/dashboard/posts/new" label="New Post" />
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {posts.map((post) => (
          <div key={post.id} className="p-6 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
                {post.excerpt && (
                  <p className="text-gray-600 text-sm mb-2">
                    <HighlightText text={post.excerpt} search={search} />
                  </p>
                )}
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
                <Button href={`/dashboard/posts/${post.id}/edit`} variant="plain" label="Edit" className="text-sm" />
                <DeleteButton postId={post.id} postTitle={post.title} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            href={`/dashboard?page=${page - 1}${filterSuffix}`}
            label="Previous"
            variant="outline"
            color="secondary"
            disabled={page <= 1}
          />

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <Button
            href={`/dashboard?page=${page + 1}${filterSuffix}`}
            label="Next"
            variant="outline"
            color="secondary"
            disabled={page >= totalPages}
          />
        </div>
      )}
    </div>
  );
}
