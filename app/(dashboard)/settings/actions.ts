"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuthenticatedAction } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode } from "@/lib/errors";
import { getAuthContext } from "@/lib/auth-utils";
import { updateSettingsSchema, type UpdateSettingsInput } from "@/lib/schemas";

// ============================================================================
// UPDATE SETTINGS ACTION
// ============================================================================

export async function updateSettings(
  input: unknown,
): Promise<ActionResult<void>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<UpdateSettingsInput>(
    updateSettingsSchema,
    async (data, auth) => {
      await prisma.siteSettings.upsert({
        where: { organizationId: auth.organizationId },
        update: {
          siteTitle: data.siteTitle,
          faviconUrl: data.faviconUrl || null,
          logoUrl: data.logoUrl || null,
          seoTitleTemplate: data.seoTitleTemplate,
          seoDefaultDescription: data.seoDefaultDescription || null,
          ogImageUrl: data.ogImageUrl || null,
          allowedOrigins: data.allowedOrigins || null,
        },
        create: {
          organizationId: auth.organizationId,
          siteTitle: data.siteTitle,
          faviconUrl: data.faviconUrl || null,
          logoUrl: data.logoUrl || null,
          seoTitleTemplate: data.seoTitleTemplate,
          seoDefaultDescription: data.seoDefaultDescription || null,
          ogImageUrl: data.ogImageUrl || null,
          allowedOrigins: data.allowedOrigins || null,
        },
      });

      revalidatePath("/settings");
      revalidatePath("/");
    },
  );

  return action(input, authContext);
}
