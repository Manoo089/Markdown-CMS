/**
 * Category Schema Definitions
 *
 * Centralized Zod schemas for all category-related operations
 */

import { z } from "zod";

// ============================================================================
// CREATE CATEGORY SCHEMA
// ============================================================================

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens",
    ),
  description: z.string().max(500, "Description is too long").optional(),
  parentId: z.string().nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// ============================================================================
// UPDATE CATEGORY SCHEMA
// ============================================================================

export const updateCategorySchema = createCategorySchema.extend({
  categoryId: z.string().min(1, "Category ID is required"),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// ============================================================================
// DELETE CATEGORY SCHEMA
// ============================================================================

export const deleteCategorySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
});

export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
