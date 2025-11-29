/**
 * Organization Schema Definitions
 *
 * Centralized Zod schemas for all organization-related operations
 */

import { z } from "zod";

// ============================================================================
// SHARED VALIDATORS
// ============================================================================

/**
 * Organization slug validation
 * Must be lowercase letters, numbers, and hyphens only
 */
export const organizationSlugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug must only contain lowercase letters, numbers, and hyphens",
  );

// ============================================================================
// CREATE ORGANIZATION SCHEMA
// ============================================================================

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: organizationSlugSchema,
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

// ============================================================================
// UPDATE ORGANIZATION SCHEMA
// ============================================================================

export const updateOrganizationSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Organization name is required"),
  slug: organizationSlugSchema,
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

// ============================================================================
// DELETE ORGANIZATION SCHEMA
// ============================================================================

export const deleteOrganizationSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export type DeleteOrganizationInput = z.infer<typeof deleteOrganizationSchema>;

// ============================================================================
// ADD USER TO ORGANIZATION SCHEMA
// ============================================================================

export const addUserToOrganizationSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  email: z.string().email("Invalid email address"),
  name: z.string().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  isAdmin: z.boolean(),
});

export type AddUserToOrganizationInput = z.infer<
  typeof addUserToOrganizationSchema
>;

// ============================================================================
// DELETE USER SCHEMA
// ============================================================================

export const deleteUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type DeleteUserInput = z.infer<typeof deleteUserSchema>;

// ============================================================================
// TOGGLE USER ADMIN SCHEMA
// ============================================================================

export const toggleUserAdminSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  isAdmin: z.boolean(),
});

export type ToggleUserAdminInput = z.infer<typeof toggleUserAdminSchema>;
