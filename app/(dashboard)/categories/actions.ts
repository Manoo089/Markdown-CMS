"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuthenticatedAction } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode, success } from "@/lib/errors";
import { getAuthContext } from "@/lib/auth-utils";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type DeleteCategoryInput,
} from "@/lib/schemas";

// ============================================================================
// TYPES
// ============================================================================

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  _count: { posts: number; children: number };
  createdAt: Date;
};

// ============================================================================
// GET CATEGORIES
// ============================================================================

export async function getCategories(): Promise<ActionResult<Category[]>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  try {
    const categories = await prisma.category.findMany({
      where: { organizationId: authContext.organizationId },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { posts: true, children: true } },
      },
      orderBy: { name: "asc" },
    });

    return success(categories);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return error("Failed to fetch categories", ErrorCode.DATABASE_ERROR);
  }
}

// ============================================================================
// CREATE CATEGORY
// ============================================================================

export async function createCategory(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<CreateCategoryInput, { id: string }>(
    createCategorySchema,
    async (data, auth) => {
      // Check if slug already exists in this organization
      const existing = await prisma.category.findUnique({
        where: {
          slug_organizationId: {
            slug: data.slug,
            organizationId: auth.organizationId,
          },
        },
      });

      if (existing) {
        throw new Error("A category with this slug already exists");
      }

      // If parentId is provided, verify it exists and belongs to same org
      if (data.parentId) {
        const parent = await prisma.category.findFirst({
          where: {
            id: data.parentId,
            organizationId: auth.organizationId,
          },
        });

        if (!parent) {
          throw new Error("Parent category not found");
        }
      }

      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          parentId: data.parentId || null,
          organizationId: auth.organizationId,
        },
      });

      revalidatePath("/categories");
      return { id: category.id };
    },
  );

  return action(input, authContext);
}

// ============================================================================
// UPDATE CATEGORY
// ============================================================================

export async function updateCategory(
  input: unknown,
): Promise<ActionResult<void>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<UpdateCategoryInput>(
    updateCategorySchema,
    async (data, auth) => {
      // Verify category exists and belongs to this org
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          organizationId: auth.organizationId,
        },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      // Check if new slug conflicts with another category
      if (data.slug !== category.slug) {
        const existing = await prisma.category.findUnique({
          where: {
            slug_organizationId: {
              slug: data.slug,
              organizationId: auth.organizationId,
            },
          },
        });

        if (existing) {
          throw new Error("A category with this slug already exists");
        }
      }

      // Prevent setting parent to self or to a child (circular reference)
      if (data.parentId) {
        if (data.parentId === data.categoryId) {
          throw new Error("A category cannot be its own parent");
        }

        // Check if the new parent is a descendant of this category
        const isDescendant = await checkIsDescendant(
          data.parentId,
          data.categoryId,
          auth.organizationId,
        );

        if (isDescendant) {
          throw new Error("Cannot set a child category as parent");
        }

        // Verify parent exists
        const parent = await prisma.category.findFirst({
          where: {
            id: data.parentId,
            organizationId: auth.organizationId,
          },
        });

        if (!parent) {
          throw new Error("Parent category not found");
        }
      }

      await prisma.category.update({
        where: { id: data.categoryId },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          parentId: data.parentId || null,
        },
      });

      revalidatePath("/categories");
    },
  );

  return action(input, authContext);
}

// ============================================================================
// DELETE CATEGORY
// ============================================================================

export async function deleteCategory(
  input: unknown,
): Promise<ActionResult<void>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<DeleteCategoryInput>(
    deleteCategorySchema,
    async (data, auth) => {
      // Verify category exists and belongs to this org
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          organizationId: auth.organizationId,
        },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      // Update children to have no parent (move to root level)
      await prisma.category.updateMany({
        where: { parentId: data.categoryId },
        data: { parentId: null },
      });

      // Remove category from posts (set categoryId to null)
      await prisma.post.updateMany({
        where: { categoryId: data.categoryId },
        data: { categoryId: null },
      });

      // Delete the category
      await prisma.category.delete({
        where: { id: data.categoryId },
      });

      revalidatePath("/categories");
    },
  );

  return action(input, authContext);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if potentialDescendantId is a descendant of ancestorId
 */
async function checkIsDescendant(
  potentialDescendantId: string,
  ancestorId: string,
  organizationId: string,
): Promise<boolean> {
  const category = await prisma.category.findFirst({
    where: {
      id: potentialDescendantId,
      organizationId,
    },
    select: { parentId: true },
  });

  if (!category || !category.parentId) {
    return false;
  }

  if (category.parentId === ancestorId) {
    return true;
  }

  // Recursively check parent
  return checkIsDescendant(category.parentId, ancestorId, organizationId);
}
