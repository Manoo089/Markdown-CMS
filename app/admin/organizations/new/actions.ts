"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/admin-auth";
import { createAction } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode } from "@/lib/errors";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/lib/schemas";

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

      revalidatePath("/admin/organizations");
      revalidatePath("/admin");

      // Return organization ID for redirect
      return organization.id;
    },
  );

  return action(input);
}
