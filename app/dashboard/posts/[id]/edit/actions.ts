"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth-utils";
import { createAuthenticatedAction } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode } from "@/lib/errors";
import {
  updatePostSchema,
  type UpdatePostInput,
} from "@/lib/schemas/post.schema";

// ============================================================================
// UPDATE POST ACTION
// ============================================================================

export async function updatePost(
  input: unknown,
): Promise<ActionResult<{ postId: string }>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<UpdatePostInput, { postId: string }>(
    updatePostSchema,
    async (data, auth) => {
      // Prüfe ob der Post zur Organization gehört
      const currentPost = await prisma.post.findUnique({
        where: { id: data.postId },
      });

      if (!currentPost) {
        throw new Error("Post not found");
      }

      if (currentPost.organizationId !== auth.organizationId) {
        throw new Error("You don't have permission to edit this post");
      }

      // Prüfe ob Slug bereits von ANDEREM Post genutzt wird
      const existingPost = await prisma.post.findUnique({
        where: {
          organizationId_slug: {
            organizationId: auth.organizationId,
            slug: data.slug,
          },
        },
      });

      if (existingPost && existingPost.id !== data.postId) {
        throw new Error("A post with this slug already exists");
      }

      // Post updaten
      const post = await prisma.post.update({
        where: { id: data.postId },
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || null,
          type: data.type,
          published: data.published,
          publishedAt:
            data.published && !currentPost.published
              ? new Date() // Setze publishedAt nur beim ersten Publish
              : currentPost.publishedAt,
        },
      });

      // 4. Cache invalidieren
      revalidatePath("/dashboard");
      revalidatePath("/");

      // Return post ID
      return { postId: post.id };
    },
  );

  return action(input, authContext);
}
