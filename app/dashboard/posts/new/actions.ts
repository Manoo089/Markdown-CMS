"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth-utils";
import { createAuthenticatedAction } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode } from "@/lib/errors";
import {
  createPostSchema,
  type CreatePostInput,
} from "@/lib/schemas/post.schema";

// ============================================================================
// CREATE POST ACTION
// ============================================================================

export async function createPost(
  input: unknown,
): Promise<ActionResult<{ postId: string }>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<CreatePostInput, { postId: string }>(
    createPostSchema,
    async (data, auth) => {
      // Prüfe ob Slug bereits existiert
      const existingPost = await prisma.post.findUnique({
        where: {
          organizationId_slug: {
            organizationId: auth.organizationId,
            slug: data.slug,
          },
        },
      });

      if (existingPost) {
        throw new Error("A post with this slug already exists");
      }

      // Post erstellen
      const post = await prisma.post.create({
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || null,
          type: data.type,
          published: data.published,
          publishedAt: data.published ? new Date() : null,
          authorId: auth.userId,
          organizationId: auth.organizationId,
        },
      });

      // 3. Cache invalidieren
      revalidatePath("/dashboard");
      revalidatePath("/");

      // Return post ID for redirect
      return { postId: post.id };
    },
  );

  return action(input, authContext);
}
