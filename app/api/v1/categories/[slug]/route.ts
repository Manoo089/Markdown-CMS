import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiRouteWithParams,
  apiOptions,
  apiSuccess,
  apiNotFound,
} from "@/lib/api-utils";

export const OPTIONS = apiOptions();

/**
 * GET /api/v1/categories/[slug]
 *
 * Get a single category by slug, including its posts
 *
 * Query Parameters:
 * - include_posts: boolean (default: false) - Include posts in this category
 * - posts_limit: number (default: 10) - Limit posts if included
 * - posts_published: boolean (default: true) - Only published posts
 *
 * Example:
 * ```bash
 * curl -H "Authorization: Bearer YOUR_API_KEY" \
 *   "https://your-cms.com/api/v1/categories/technology?include_posts=true"
 * ```
 */
export const GET = apiRouteWithParams<{ slug: string }>(
  async (request: NextRequest, { organization }, { slug }) => {
    const { searchParams } = new URL(request.url);
    const includePosts = searchParams.get("include_posts") === "true";
    const postsLimit = parseInt(searchParams.get("posts_limit") || "10");
    const postsPublished = searchParams.get("posts_published") !== "false";

    // Fetch category
    const category = await prisma.category.findUnique({
      where: {
        slug_organizationId: {
          slug,
          organizationId: organization.id,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: { posts: true },
        },
        ...(includePosts && {
          posts: {
            where: postsPublished ? { published: true } : {},
            orderBy: { createdAt: "desc" as const },
            take: postsLimit,
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              type: true,
              published: true,
              publishedAt: true,
              createdAt: true,
            },
          },
        }),
      },
    });

    if (!category) {
      return apiNotFound("Category");
    }

    // Transform response
    const data = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt,
      parent: category.parent,
      children: category.children,
      postCount: category._count.posts,
      ...(includePosts && {
        posts: (category as { posts?: unknown[] }).posts,
      }),
    };

    return apiSuccess(data);
  },
);
