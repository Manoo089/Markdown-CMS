import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { withCors, handleOptions } from "@/lib/api-cors";

interface Props {
  params: Promise<{ slug: string }>;
}

// Handle OPTIONS preflight
export async function OPTIONS(request: NextRequest) {
  const auth = await validateApiKey(request);
  const origin = request.headers.get("origin") || undefined;

  if ("error" in auth) {
    return handleOptions(origin, "*");
  }

  return handleOptions(origin, auth.settings?.allowedOrigins);
}

export async function GET(request: NextRequest, { params }: Props) {
  const origin = request.headers.get("origin") || undefined;

  // Auth
  const auth = await validateApiKey(request);

  if ("error" in auth) {
    return withCors(
      NextResponse.json({ error: auth.error }, { status: auth.status }),
      origin,
      "*",
    );
  }

  const { organization, settings } = auth;
  const { slug } = await params;

  // Fetch post
  const post = await prisma.post.findUnique({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug,
      },
    },
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
  });

  if (!post) {
    return withCors(
      NextResponse.json({ error: "Post not found" }, { status: 404 }),
      origin,
      settings?.allowedOrigins,
    );
  }

  return withCors(
    NextResponse.json({ data: post }),
    origin,
    settings?.allowedOrigins,
  );
}
