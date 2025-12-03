"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { adminAction } from "@/lib/action-utils";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/lib/schemas";

// ============================================================================
// CREATE ORGANIZATION ACTION
// ============================================================================

export const createOrganization = adminAction<CreateOrganizationInput, string>(
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

    revalidatePath("/admin/organizations");
    revalidatePath("/admin");

    // Return organization ID for redirect
    return organization.id;
  },
);
