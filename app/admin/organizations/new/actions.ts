"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/admin-auth";

export async function createOrganization(data: { name: string; slug: string }) {
  try {
    await requireAdmin();

    // Validierung
    if (!data.name || !data.slug) {
      return { error: "Name and slug are required" };
    }

    // Prüfen ob Slug bereits existiert
    const existing = await prisma.organization.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return { error: "Slug is already in use" };
    }

    // Organization erstellen mit Default Settings
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

    revalidatePath("/admin/organizations");
    revalidatePath("/admin");

    return { success: true, organizationId: organization.id };
  } catch (error) {
    console.error("Failed to create organization:", error);
    return { error: "Failed to create organization" };
  }
}
