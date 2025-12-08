"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth-utils";
import { ActionResult, error, ErrorCode, validationError } from "@/lib/errors";
import { createPostSchemaForOrg } from "@/lib/schemas";
import { getContentTypeConfig, getAllowedTypeValues } from "@/lib/utils";
import { sanitizeContent } from "@/lib/sanitize";

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

  try {
    // Get content type config (cached)
    const config = await getContentTypeConfig(authContext.organizationId);
    const allowedTypes = getAllowedTypeValues(config);

    // Create organization-specific schema
    const schema = createPostSchemaForOrg(allowedTypes);

    // Validate input with organization-specific schema
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const data = parsed.data;

    // Extract categoryId and tagIds from input (not in schema, handled separately)
    const categoryId = (input as { categoryId?: string | null })?.categoryId;
    const tagIds = (input as { tagIds?: string[] })?.tagIds || [];

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

    // Validate tagIds if provided
    if (tagIds.length > 0) {
      const validTags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          organizationId: authContext.organizationId,
        },
        select: { id: true },
      });

      if (validTags.length !== tagIds.length) {
        return error("One or more tags not found", ErrorCode.VALIDATION_ERROR);
      }
    }

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: {
        organizationId_slug: {
          organizationId: authContext.organizationId,
          slug: data.slug,
        },
      },
    });

    if (existingPost) {
      return error(
        "A post with this slug already exists",
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const sanitizedConent = sanitizeContent(data.content);

    // Create post with tags
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: sanitizedConent,
        excerpt: data.excerpt || null,
        type: data.type,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        authorId: authContext.userId,
        organizationId: authContext.organizationId,
        categoryId: categoryId || null,
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });

    // Invalidate cache
    revalidatePath("/");
    revalidatePath("/posts");

    // Return post ID for redirect
    return { success: true, data: { postId: post.id } };
  } catch (err) {
    console.error("Create post error:", err);
    return error(
      err instanceof Error ? err.message : "Failed to create post",
      ErrorCode.INTERNAL_ERROR,
    );
  }
}
