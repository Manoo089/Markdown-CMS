"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/admin-auth";
import bcrypt from "bcryptjs";
import { createAction } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode } from "@/lib/errors";
import {
  deleteOrganizationSchema,
  updateOrganizationSchema,
  addUserToOrganizationSchema,
  deleteUserSchema,
  toggleUserAdminSchema,
  type UpdateOrganizationInput,
  type DeleteOrganizationInput,
  type AddUserToOrganizationInput,
  type DeleteUserInput,
  type ToggleUserAdminInput,
} from "@/lib/schemas";

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

  const action = createAction<DeleteOrganizationInput, void>(
    deleteOrganizationSchema,
    async (data) => {
      // Cascade Delete wird automatisch durch Prisma Schema gehandhabt
      await prisma.organization.delete({
        where: { id: data.organizationId },
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

  const action = createAction<AddUserToOrganizationInput, void>(
    addUserToOrganizationSchema,
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

  const action = createAction<DeleteUserInput, void>(
    deleteUserSchema,
    async (data) => {
      // Delete user (Cascade Delete für Posts/Sessions durch Schema)
      await prisma.user.delete({
        where: { id: data.userId },
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
