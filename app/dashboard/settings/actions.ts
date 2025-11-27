"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createAuthenticatedAction, AuthContext } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode } from "@/lib/errors";

// ============================================================================
// HELPER: GET AUTH CONTEXT
// ============================================================================

async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.organizationId) {
    return null;
  }

  return {
    userId: session.user.id,
    userEmail: session.user.email || "",
    organizationId: session.user.organizationId,
    isAdmin: session.user.isAdmin || false,
  };
}

// ============================================================================
// SETTINGS SCHEMA
// ============================================================================

const settingsSchema = z.object({
  siteTitle: z.string().min(1, "Site title is required"),
  faviconUrl: z.url("Invalid favicon URL").optional().or(z.literal("")),
  logoUrl: z.url("Invalid logo URL").optional().or(z.literal("")),
  seoTitleTemplate: z.string().min(1, "SEO title template is required"),
  seoDefaultDescription: z.string().optional().or(z.literal("")),
  ogImageUrl: z.url("Invalid OG image URL").optional().or(z.literal("")),
  allowedOrigins: z.string().optional().or(z.literal("")),
});

type UpdateSettingsInput = z.infer<typeof settingsSchema>;

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
    settingsSchema,
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

      revalidatePath("/dashboard/settings");
      revalidatePath("/");
    },
  );

  return action(input, authContext);
}
