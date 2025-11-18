"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

type UpdateSettingsInput = {
  siteTitle: string;
  faviconUrl?: string;
  logoUrl?: string;
  seoTitleTemplate: string;
  seoDefaultDescription?: string;
  ogImageUrl?: string;
  allowedOrigins?: string;
};

export async function updateSettings(data: UpdateSettingsInput) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return { error: "Unauthorized" };
    }

    const organizationId = session.user.organizationId;

    // Upsert: Update wenn existiert, sonst Create
    const settings = await prisma.siteSettings.upsert({
      where: { organizationId },
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
        organizationId,
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

    return { success: true, settingsId: settings.id };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { error: "Failed to update settings. Please try again." };
  }
}
