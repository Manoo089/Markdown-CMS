/**
 * Post Schema Definitions
 *
 * Centralized Zod schemas for all post-related operations
 */

import { z } from "zod";

// ============================================================================
// POST TYPE ENUM
// ============================================================================

export const postTypeEnum = z.enum(["post", "page", "service"]);
export type PostType = z.infer<typeof postTypeEnum>;

// ============================================================================
// CREATE POST SCHEMA
// ============================================================================

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens",
    ),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  type: postTypeEnum,
  published: z.boolean(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

// ============================================================================
// UPDATE POST SCHEMA
// ============================================================================

export const updatePostSchema = createPostSchema.extend({
  postId: z.string().min(1, "Post ID is required"),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

// ============================================================================
// DELETE POST SCHEMA
// ============================================================================

export const deletePostSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
});

export type DeletePostInput = z.infer<typeof deletePostSchema>;
