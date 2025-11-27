"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/admin-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createAction } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode } from "@/lib/errors";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens",
    ),
});

const updateOrganizationSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Organization name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens",
    ),
});

const deleteOrganizationSchema = z
  .string()
  .min(1, "Organization ID is required");

const addUserSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  email: z.string().email("Invalid email address"),
  name: z.string().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  isAdmin: z.boolean(),
});

const deleteUserSchema = z.string().min(1, "User ID is required");

const toggleUserAdminSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  isAdmin: z.boolean(),
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
type AddUserInput = z.infer<typeof addUserSchema>;
type ToggleUserAdminInput = z.infer<typeof toggleUserAdminSchema>;

// ============================================================================
// CREATE ORGANIZATION ACTION
// ============================================================================

export async function createOrganization(
  input: unknown,
): Promise<ActionResult<string>> {
  // Check admin access first
  try {
    await requireAdmin();
  } catch (err) {
    return error(
      "Unauthorized - Admin access required",
      ErrorCode.UNAUTHORIZED,
    );
  }

  // ✅ NEU: createAction macht Validierung automatisch
  const action = createAction<CreateOrganizationInput, string>(
    createOrganizationSchema,
    async (data) => {
      // Check if slug already exists
      const existing = await prisma.organization.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new Error("Slug is already in use");
      }

      // Create organization with default settings
      const organization = await prisma.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          settings: {
            create: {
              siteTitle: data.name,
              seoTitleTemplate: `%s | ${data.name}`,
            },
          },
        },
      });

      // Revalidate paths
      revalidatePath("/admin/organizations");
      revalidatePath("/admin");

      // Return organization ID for redirect
      return organization.id;
    },
  );

  return action(input);
}

// ============================================================================
// UPDATE ORGANIZATION ACTION
// ============================================================================

export async function updateOrganization(
  input: unknown,
): Promise<ActionResult<void>> {
  // Check admin access first
  try {
    await requireAdmin();
  } catch (err) {
    return error(
      "Unauthorized - Admin access required",
      ErrorCode.UNAUTHORIZED,
    );
  }

  const action = createAction<UpdateOrganizationInput, void>(
    updateOrganizationSchema,
    async (data) => {
      // Check if slug already exists (except for this organization)
      const existing = await prisma.organization.findUnique({
        where: { slug: data.slug },
      });

      if (existing && existing.id !== data.organizationId) {
        throw new Error("Slug is already in use");
      }

      // Update organization
      await prisma.organization.update({
        where: { id: data.organizationId },
        data: {
          name: data.name,
          slug: data.slug,
        },
      });

      // Revalidate paths
      revalidatePath("/admin/organizations");
      revalidatePath(`/admin/organizations/${data.organizationId}`);
    },
  );

  return action(input);
}

// ============================================================================
// DELETE ORGANIZATION ACTION
// ============================================================================

export async function deleteOrganization(
  input: unknown,
): Promise<ActionResult<void>> {
  // Check admin access first
  try {
    await requireAdmin();
  } catch (err) {
    return error(
      "Unauthorized - Admin access required",
      ErrorCode.UNAUTHORIZED,
    );
  }

  const action = createAction<string, void>(
    deleteOrganizationSchema,
    async (organizationId) => {
      // Cascade Delete wird automatisch durch Prisma Schema gehandhabt
      await prisma.organization.delete({
        where: { id: organizationId },
      });

      // Revalidate paths
      revalidatePath("/admin/organizations");
      revalidatePath("/admin");
    },
  );

  return action(input);
}

// ============================================================================
// ADD USER TO ORGANIZATION ACTION
// ============================================================================

export async function addUserToOrganization(
  input: unknown,
): Promise<ActionResult<void>> {
  // Check admin access first
  try {
    await requireAdmin();
  } catch (err) {
    return error(
      "Unauthorized - Admin access required",
      ErrorCode.UNAUTHORIZED,
    );
  }

  const action = createAction<AddUserInput, void>(
    addUserSchema,
    async (data) => {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("Email is already in use");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          isAdmin: data.isAdmin,
          organizationId: data.organizationId,
        },
      });

      // Revalidate paths
      revalidatePath(`/admin/organizations/${data.organizationId}`);
      revalidatePath("/admin/users");
    },
  );

  return action(input);
}

// ============================================================================
// DELETE USER ACTION
// ============================================================================

export async function deleteUser(input: unknown): Promise<ActionResult<void>> {
  // Check admin access first
  try {
    await requireAdmin();
  } catch (err) {
    return error(
      "Unauthorized - Admin access required",
      ErrorCode.UNAUTHORIZED,
    );
  }

  const action = createAction<string, void>(
    deleteUserSchema,
    async (userId) => {
      // Delete user (Cascade Delete für Posts/Sessions durch Schema)
      await prisma.user.delete({
        where: { id: userId },
      });

      // Revalidate paths
      revalidatePath("/admin/organizations");
      revalidatePath("/admin/users");
    },
  );

  return action(input);
}

// ============================================================================
// TOGGLE USER ADMIN ACTION
// ============================================================================

export async function toggleUserAdmin(
  input: unknown,
): Promise<ActionResult<void>> {
  // Check admin access first
  try {
    await requireAdmin();
  } catch (err) {
    return error(
      "Unauthorized - Admin access required",
      ErrorCode.UNAUTHORIZED,
    );
  }

  const action = createAction<ToggleUserAdminInput, void>(
    toggleUserAdminSchema,
    async (data) => {
      // Update user admin status
      await prisma.user.update({
        where: { id: data.userId },
        data: { isAdmin: data.isAdmin },
      });

      // Revalidate paths
      revalidatePath("/admin/organizations");
      revalidatePath("/admin/users");
    },
  );

  return action(input);
}
