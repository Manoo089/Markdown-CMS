/**
 * Content Type Management Schemas
 *
 * Schemas for admin operations on organization content types.
 * Only admins can add, edit, or delete content types.
 */

import { z } from "zod";

// ============================================================================
// CONTENT TYPE DEFINITION SCHEMA
// ============================================================================

/**
 * Single content type definition schema
 * Validates individual content type objects
 */
export const contentTypeDefinitionSchema = z.object({
  value: z
    .string()
    .min(1, "Value is required")
    .max(50, "Value must be 50 characters or less")
    .regex(
      /^[a-z0-9-]+$/,
      "Value must only contain lowercase letters, numbers, and hyphens",
    ),
  label: z
    .string()
    .min(1, "Label is required")
    .max(100, "Label must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  icon: z.string().max(10, "Icon must be 10 characters or less").optional(),
  color: z.string().max(50, "Color must be 50 characters or less").optional(),
});

export type ContentTypeDefinitionInput = z.infer<
  typeof contentTypeDefinitionSchema
>;

// ============================================================================
// ADMIN ACTION SCHEMAS
// ============================================================================

/**
 * Add content type to organization
 */
export const addContentTypeSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  contentType: contentTypeDefinitionSchema,
});

export type AddContentTypeInput = z.infer<typeof addContentTypeSchema>;

/**
 * Update content type in organization
 */
export const updateContentTypeSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  originalValue: z.string().min(1, "Original value is required"),
  contentType: contentTypeDefinitionSchema,
});

export type UpdateContentTypeInput = z.infer<typeof updateContentTypeSchema>;

/**
 * Delete content type from organization
 */
export const deleteContentTypeSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  typeValue: z.string().min(1, "Type value is required"),
});

export type DeleteContentTypeInput = z.infer<typeof deleteContentTypeSchema>;
