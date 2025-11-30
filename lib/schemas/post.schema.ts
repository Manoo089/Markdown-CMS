/**
 * Post Schema Definitions
 *
 * Centralized Zod schemas for all post-related operations
 */

import { z } from "zod";

// ============================================================================
// POST TYPE ENUM
// ============================================================================

/**
 * Base post type validation (accepts any non-empty string)
 * Use this for generic validation when organization context is not available
 */
export const postTypeSchema = z.string().min(1, "Type is required");

/**
 * Post Type Enum for backwards compatibility
 * @deprecated Use organization-specific validation via createPostSchemaForOrg
 */
export const postTypeEnum = z.enum(["post", "page", "service"]);
export type PostType = z.infer<typeof postTypeEnum>;

// ============================================================================
// DYNAMIC SCHEMA CREATION
// ============================================================================

/**
 * Create organization-specific post schema with allowed types
 *
 * @param allowedTypes - Array of allowed type values for the organization
 * @returns Zod schema with organization-specific type validation
 *
 * @example
 * ```typescript
 * const allowedTypes = ["post", "menu-item", "event"];
 * const schema = createPostSchemaForOrg(allowedTypes);
 * const validated = schema.parse(input);
 * ```
 */
export function createPostSchemaForOrg(allowedTypes: string[]) {
  if (allowedTypes.length === 0) {
    throw new Error("Organization must have at least one allowed post type");
  }

  // Create dynamic enum from allowed types
  const typeEnum = z.enum(allowedTypes as [string, ...string[]]);

  return z.object({
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
    type: typeEnum, // Dynamic validation based on organization
    published: z.boolean(),
  });
}

/**
 * Create organization-specific update post schema
 *
 * @param allowedTypes - Array of allowed type values for the organization
 * @returns Zod schema for updating posts with organization-specific validation
 */
export function createUpdatePostSchemaForOrg(allowedTypes: string[]) {
  const baseSchema = createPostSchemaForOrg(allowedTypes);

  return baseSchema.extend({
    postId: z.string().min(1, "Post ID is required"),
  });
}

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
