import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  // Auth
  const auth = await validateApiKey(request);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organization } = auth;

  // Query Parameters
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const published = searchParams.get("published");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Build where clause
  const where: any = {
    organizationId: organization.id,
  };

  if (type) {
    where.type = type;
  }

  if (published !== null) {
    where.published = published === "true";
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
      },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    data: posts,
    meta: {
      total,
      limit,
      offset,
    },
  });
}
