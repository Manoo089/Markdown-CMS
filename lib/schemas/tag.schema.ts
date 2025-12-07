/**
 * Tag Schema Definitions
 *
 * Centralized Zod schemas for all tag-related operations
 */

import { z } from "zod";

// ============================================================================
// CREATE TAG SCHEMA
// ============================================================================

export const createTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens",
    ),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

// ============================================================================
// UPDATE TAG SCHEMA
// ============================================================================

export const updateTagSchema = createTagSchema.extend({
  tagId: z.string().min(1, "Tag ID is required"),
});

export type UpdateTagInput = z.infer<typeof updateTagSchema>;

// ============================================================================
// DELETE TAG SCHEMA
// ============================================================================

export const deleteTagSchema = z.object({
  tagId: z.string().min(1, "Tag ID is required"),
});

export type DeleteTagInput = z.infer<typeof deleteTagSchema>;
