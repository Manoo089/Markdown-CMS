"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth-utils";
import { ActionResult, error, ErrorCode, validationError } from "@/lib/errors";
import { createUpdatePostSchemaForOrg } from "@/lib/schemas";
import { getContentTypeConfig, getAllowedTypeValues } from "@/lib/utils";

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

  try {
    // Get content type config (cached)
    const config = await getContentTypeConfig(authContext.organizationId);
    const allowedTypes = getAllowedTypeValues(config);

    // Create organization-specific schema
    const schema = createUpdatePostSchemaForOrg(allowedTypes);

    // Validate input with organization-specific schema
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const data = parsed.data;

    // Extract categoryId from input (not in schema, handled separately)
    const categoryId = (input as { categoryId?: string | null })?.categoryId;

    // Validate categoryId if provided
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          organizationId: authContext.organizationId,
        },
      });

      if (!category) {
        return error("Category not found", ErrorCode.VALIDATION_ERROR);
      }
    }

    // Check if post exists and belongs to organization
    const currentPost = await prisma.post.findUnique({
      where: { id: data.postId },
    });

    if (!currentPost) {
      return error("Post not found", ErrorCode.NOT_FOUND);
    }

    if (currentPost.organizationId !== authContext.organizationId) {
      return error(
        "You don't have permission to edit this post",
        ErrorCode.UNAUTHORIZED,
      );
    }

    // Prüfe ob Slug bereits von ANDEREM Post genutzt wird
    const existingPost = await prisma.post.findUnique({
      where: {
        organizationId_slug: {
          organizationId: authContext.organizationId,
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
        categoryId: categoryId || null,
      },
    });

    // Cache invalidieren
    revalidatePath("/");
    revalidatePath("/posts");

    return { success: true, data: { postId: post.id } };
  } catch (err) {
    console.error("Update post error:", err);
    return error(
      err instanceof Error ? err.message : "Failed to update post",
      ErrorCode.INTERNAL_ERROR,
    );
  }
}
