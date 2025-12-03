"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth-utils";
import { ActionResult, error, ErrorCode, validationError } from "@/lib/errors";
import { createUpdatePostSchemaForOrg } from "@/lib/schemas";
import { parseContentTypeConfig, getAllowedTypeValues } from "@/lib/utils";

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
    // Get organization with content type config
    const org = await prisma.organization.findUnique({
      where: { id: authContext.organizationId },
      select: { contentTypeConfig: true },
    });

    if (!org) {
      return error("Organization not found", ErrorCode.NOT_FOUND);
    }

    // Parse content type config and get allowed types
    const config = parseContentTypeConfig(org.contentTypeConfig);
    const allowedTypes = getAllowedTypeValues(config);

    // Create organization-specific schema
    const schema = createUpdatePostSchemaForOrg(allowedTypes);

    // Validate input with organization-specific schema
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const data = parsed.data;

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
      },
    });

    // 4. Cache invalidieren
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true, data: { postId: post.id } };
  } catch (err) {
    console.error("Update post error:", err);
    return error(
      err instanceof Error ? err.message : "Failed to update post",
      ErrorCode.INTERNAL_ERROR,
    );
  }
}
