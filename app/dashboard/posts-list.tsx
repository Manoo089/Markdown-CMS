import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { POSTS_PER_PAGE } from "@/lib/constants";

import Button from "@/ui/Button";
import PostCard from "@/components/PostCard";

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
        <p className="text-text-muted mb-4">
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

      <div className="bg-surface rounded-lg shadow divide-y divide-border overflow-hidden">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} search={search} />
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

          <span className="px-4 py-2 text-sm text-text-muted">
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
