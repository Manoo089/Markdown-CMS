"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { adminAction } from "@/lib/action-utils";
import {
  deleteOrganizationSchema,
  updateOrganizationSchema,
  addUserToOrganizationSchema,
  deleteUserSchema,
  toggleUserAdminSchema,
  addContentTypeSchema,
  updateContentTypeSchema,
  deleteContentTypeSchema,
  type UpdateOrganizationInput,
  type DeleteOrganizationInput,
  type AddUserToOrganizationInput,
  type DeleteUserInput,
  type ToggleUserAdminInput,
  type AddContentTypeInput,
  type UpdateContentTypeInput,
  type DeleteContentTypeInput,
} from "@/lib/schemas";
import {
  invalidateContentTypeCache,
  parseContentTypeConfig,
  serializeContentTypeConfig,
} from "@/lib/utils/content-types";
import { ContentTypeConfig } from "@/types/content-type";

// ============================================================================
// UPDATE ORGANIZATION ACTION
// ============================================================================

export const updateOrganization = adminAction<UpdateOrganizationInput, void>(
  updateOrganizationSchema,
  async (data) => {
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

// ============================================================================
// DELETE ORGANIZATION ACTION
// ============================================================================

export const deleteOrganization = adminAction<DeleteOrganizationInput, void>(
  deleteOrganizationSchema,
  async (data) => {
    await prisma.organization.delete({
      where: { id: data.organizationId },
    });

    // Revalidate paths
    revalidatePath("/admin/organizations");
    revalidatePath("/admin");
  },
);

// ============================================================================
// ADD USER TO ORGANIZATION ACTION
// ============================================================================

export const addUserToOrganization = adminAction<
  AddUserToOrganizationInput,
  void
>(addUserToOrganizationSchema, async (data) => {
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
});

// ============================================================================
// DELETE USER ACTION
// ============================================================================

export const deleteUser = adminAction<DeleteUserInput, void>(
  deleteUserSchema,
  async (data) => {
    await prisma.user.delete({
      where: { id: data.userId },
    });

    revalidatePath("/admin/organizations");
    revalidatePath("/admin/users");
  },
);

// ============================================================================
// TOGGLE USER ADMIN ACTION
// ============================================================================

export const toggleUserAdmin = adminAction<ToggleUserAdminInput, void>(
  toggleUserAdminSchema,
  async (data) => {
    await prisma.user.update({
      where: { id: data.userId },
      data: { isAdmin: data.isAdmin },
    });

    // Revalidate paths
    revalidatePath("/admin/organizations");
    revalidatePath("/admin/users");
  },
);

// ============================================================================
// CONTENT TYPE MANAGEMENT ACTIONS
// ============================================================================

/**
 * Helper to get organization with content type config
 */
async function getOrganizationConfig(
  organizationId: string,
): Promise<ContentTypeConfig> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { contentTypeConfig: true },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  return parseContentTypeConfig(org.contentTypeConfig);
}

/**
 * Add a new content type to an organization
 */
export const addContentType = adminAction<AddContentTypeInput, void>(
  addContentTypeSchema,
  async (data) => {
    const config = await getOrganizationConfig(data.organizationId);

    // Check if value already exists
    const exists = config.types.some((t) => t.value === data.contentType.value);
    if (exists) {
      throw new Error(
        `Content type "${data.contentType.value}" already exists`,
      );
    }

    // Add new type
    const newConfig: ContentTypeConfig = {
      types: [...config.types, data.contentType],
    };

    // Save to database
    await prisma.organization.update({
      where: { id: data.organizationId },
      data: { contentTypeConfig: serializeContentTypeConfig(newConfig) },
    });

    await invalidateContentTypeCache();
    revalidatePath(`/admin/organizations/${data.organizationId}`);
  },
);

/**
 * Update an existing content type
 */
export const updateContentType = adminAction<UpdateContentTypeInput, void>(
  updateContentTypeSchema,
  async (data) => {
    const config = await getOrganizationConfig(data.organizationId);

    // Find the type to update
    const typeIndex = config.types.findIndex(
      (t) => t.value === data.originalValue,
    );
    if (typeIndex === -1) {
      throw new Error(`Content type "${data.originalValue}" not found`);
    }

    // Check if new value already exists (if value is being changed)
    if (data.originalValue !== data.contentType.value) {
      const valueExists = config.types.some(
        (t) => t.value === data.contentType.value,
      );
      if (valueExists) {
        throw new Error(
          `Content type "${data.contentType.value}" already exists`,
        );
      }

      // Update posts with old type value to new value
      await prisma.post.updateMany({
        where: {
          organizationId: data.organizationId,
          type: data.originalValue,
        },
        data: { type: data.contentType.value },
      });
    }

    // Update the type
    const newConfig: ContentTypeConfig = {
      types: config.types.map((t, i) =>
        i === typeIndex ? data.contentType : t,
      ),
    };

    // Save to database
    await prisma.organization.update({
      where: { id: data.organizationId },
      data: { contentTypeConfig: serializeContentTypeConfig(newConfig) },
    });

    await invalidateContentTypeCache();
    revalidatePath(`/admin/organizations/${data.organizationId}`);
  },
);

/**
 * Delete a content type from an organization
 */
export const deleteContentType = adminAction<DeleteContentTypeInput, void>(
  deleteContentTypeSchema,
  async (data) => {
    const config = await getOrganizationConfig(data.organizationId);

    // Check if this is the last type
    if (config.types.length <= 1) {
      throw new Error(
        "Cannot delete the last content type. Organizations must have at least one content type.",
      );
    }

    // Check if any posts use this type
    const postsUsingType = await prisma.post.count({
      where: {
        organizationId: data.organizationId,
        type: data.typeValue,
      },
    });

    if (postsUsingType > 0) {
      throw new Error(
        `Cannot delete: ${postsUsingType} post(s) are using this content type. Please change their type first.`,
      );
    }

    // Remove the type
    const newConfig: ContentTypeConfig = {
      types: config.types.filter((t) => t.value !== data.typeValue),
    };

    // Save to database
    await prisma.organization.update({
      where: { id: data.organizationId },
      data: { contentTypeConfig: serializeContentTypeConfig(newConfig) },
    });

    await invalidateContentTypeCache();
    revalidatePath(`/admin/organizations/${data.organizationId}`);
  },
);
