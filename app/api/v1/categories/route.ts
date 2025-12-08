import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiRoute, apiOptions, apiSuccessWithMeta } from "@/lib/api-utils";

export const OPTIONS = apiOptions();

/**
 * GET /api/v1/categories
 *
 * List all categories for the organization
 *
 * Query Parameters:
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 * - parent: string (filter by parent slug, use "root" for top-level only)
 *
 * Example:
 * ```bash
 * curl -H "Authorization: Bearer YOUR_API_KEY" \
 *   "https://your-cms.com/api/v1/categories?limit=10"
 * ```
 */
export const GET = apiRoute(async (request: NextRequest, { organization }) => {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");
  const parent = searchParams.get("parent");

  // Build where clause
  const where: {
    organizationId: string;
    parentId?: string | null;
    parent?: { slug: string };
  } = {
    organizationId: organization.id,
  };

  // Filter by parent
  if (parent === "root") {
    where.parentId = null;
  } else if (parent) {
    where.parent = { slug: parent };
  }

  // Fetch categories
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip: offset,
      take: limit,
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
      },
    }),
    prisma.category.count({ where }),
  ]);

  // Transform response
  const data = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdAt: category.createdAt,
    parent: category.parent,
    children: category.children,
    postCount: category._count.posts,
  }));

  return apiSuccessWithMeta(data, { total, limit, offset });
});
