import { prisma } from "@/lib/prisma";
import {
  apiRouteWithParams,
  apiOptions,
  apiSuccess,
  apiNotFound,
} from "@/lib/api-utils";

export const OPTIONS = apiOptions();

export const GET = apiRouteWithParams<{ slug: string }>(
  async (request, { organization }, { slug }) => {
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
      return apiNotFound("Post");
    }

    return apiSuccess(post);
  },
);
