"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuthenticatedAction } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode, success } from "@/lib/errors";
import { getAuthContext } from "@/lib/auth-utils";
import {
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
  type CreateTagInput,
  type UpdateTagInput,
  type DeleteTagInput,
} from "@/lib/schemas";

// ============================================================================
// TYPES
// ============================================================================

export type Tag = {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
  createdAt: Date;
};

// ============================================================================
// GET TAGS
// ============================================================================

export async function getTags(): Promise<ActionResult<Tag[]>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  try {
    const tags = await prisma.tag.findMany({
      where: { organizationId: authContext.organizationId },
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { name: "asc" },
    });

    return success(tags);
  } catch (err) {
    console.error("Failed to fetch tags:", err);
    return error("Failed to fetch tags", ErrorCode.DATABASE_ERROR);
  }
}

// ============================================================================
// CREATE TAG
// ============================================================================

export async function createTag(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<CreateTagInput, { id: string }>(
    createTagSchema,
    async (data, auth) => {
      // Check if slug already exists in this organization
      const existing = await prisma.tag.findUnique({
        where: {
          slug_organizationId: {
            slug: data.slug,
            organizationId: auth.organizationId,
          },
        },
      });

      if (existing) {
        throw new Error("A tag with this slug already exists");
      }

      const tag = await prisma.tag.create({
        data: {
          name: data.name,
          slug: data.slug,
          organizationId: auth.organizationId,
        },
      });

      revalidatePath("/tags");
      return { id: tag.id };
    },
  );

  return action(input, authContext);
}

// ============================================================================
// UPDATE TAG
// ============================================================================

export async function updateTag(input: unknown): Promise<ActionResult<void>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<UpdateTagInput>(
    updateTagSchema,
    async (data, auth) => {
      // Verify tag exists and belongs to this org
      const tag = await prisma.tag.findFirst({
        where: {
          id: data.tagId,
          organizationId: auth.organizationId,
        },
      });

      if (!tag) {
        throw new Error("Tag not found");
      }

      // Check if new slug conflicts with another tag
      if (data.slug !== tag.slug) {
        const existing = await prisma.tag.findUnique({
          where: {
            slug_organizationId: {
              slug: data.slug,
              organizationId: auth.organizationId,
            },
          },
        });

        if (existing) {
          throw new Error("A tag with this slug already exists");
        }
      }

      await prisma.tag.update({
        where: { id: data.tagId },
        data: {
          name: data.name,
          slug: data.slug,
        },
      });

      revalidatePath("/tags");
    },
  );

  return action(input, authContext);
}

// ============================================================================
// DELETE TAG
// ============================================================================

export async function deleteTag(input: unknown): Promise<ActionResult<void>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<DeleteTagInput>(
    deleteTagSchema,
    async (data, auth) => {
      // Verify tag exists and belongs to this org
      const tag = await prisma.tag.findFirst({
        where: {
          id: data.tagId,
          organizationId: auth.organizationId,
        },
      });

      if (!tag) {
        throw new Error("Tag not found");
      }

      // Delete the tag (Prisma will automatically remove from posts via many-to-many)
      await prisma.tag.delete({
        where: { id: data.tagId },
      });

      revalidatePath("/tags");
    },
  );

  return action(input, authContext);
}
