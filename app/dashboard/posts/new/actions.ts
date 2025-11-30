"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth-utils";
import { ActionResult, error, ErrorCode, validationErrors } from "@/lib/errors";
import { createPostSchemaForOrg } from "@/lib/schemas";
import { parseContentTypeConfig, getAllowedTypeValues } from "@/lib/utils";

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
    const schema = createPostSchemaForOrg(allowedTypes);

    // Validate input with organization-specific schema
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return validationErrors(parsed.error);
    }

    const data = parsed.data;

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

    // Create post
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        type: data.type, // Validated against organization's allowed types
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        authorId: authContext.userId,
        organizationId: authContext.organizationId,
      },
    });

    // Invalidate cache
    revalidatePath("/dashboard");
    revalidatePath("/");

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
