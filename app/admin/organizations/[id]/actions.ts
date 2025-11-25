"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/admin-auth";
import bcrypt from "bcryptjs";

export async function updateOrganization(
  organizationId: string,
  data: { name: string; slug: string },
) {
  try {
    await requireAdmin();

    // Prüfen ob Slug bereits existiert (außer für diese Organization)
    const existing = await prisma.organization.findUnique({
      where: { slug: data.slug },
    });

    if (existing && existing.id !== organizationId) {
      return { error: "Slug is already in use" };
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    revalidatePath("/admin/organizations");
    revalidatePath(`/admin/organizations/${organizationId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update organization:", error);
    return { error: "Failed to update organization" };
  }
}

export async function deleteOrganization(organizationId: string) {
  try {
    await requireAdmin();

    // Cascade Delete wird automatisch durch Prisma Schema gehandhabt
    // (onDelete: Cascade bei allen Relations)
    await prisma.organization.delete({
      where: { id: organizationId },
    });

    revalidatePath("/admin/organizations");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return { error: "Failed to delete organization" };
  }
}

export async function addUserToOrganization(
  organizationId: string,
  data: {
    email: string;
    name: string | null;
    password: string;
    isAdmin: boolean;
  },
) {
  try {
    await requireAdmin();

    // Validierung
    if (!data.email || !data.password) {
      return { error: "Email and password are required" };
    }

    if (data.password.length < 8) {
      return { error: "Password must be at least 8 characters" };
    }

    // Prüfen ob Email bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "Email is already in use" };
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // User erstellen
    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        isAdmin: data.isAdmin,
        organizationId,
      },
    });

    revalidatePath(`/admin/organizations/${organizationId}`);
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { error: "Failed to create user" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await requireAdmin();

    // User löschen (Cascade Delete für Posts/Sessions durch Schema)
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/organizations");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete user" };
  }
}

export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
    });

    revalidatePath("/admin/organizations");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { error: "Failed to update user" };
  }
}
