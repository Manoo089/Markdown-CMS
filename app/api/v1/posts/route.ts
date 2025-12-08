import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiRoute, apiOptions, apiSuccessWithMeta } from "@/lib/api-utils";

export const OPTIONS = apiOptions();

export const GET = apiRoute(async (request: NextRequest, { organization }) => {
  // Query Parameters
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const published = searchParams.get("published");
  const categorySlug = searchParams.get("category");
  const tagSlugs = searchParams.getAll("tag");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Build where clause
  const where: Prisma.PostWhereInput = {
    organizationId: organization.id,
  };

  if (type) {
    where.type = type;
  }

  if (published !== null) {
    where.published = published === "true";
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  // Filter by tag slugs (posts must have ALL specified tags)
  if (tagSlugs.length > 0) {
    where.tags = {
      some: {
        slug: { in: tagSlugs },
      },
    };
  }

  // Fetch posts
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        type: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return apiSuccessWithMeta(posts, { total, limit, offset });
});
