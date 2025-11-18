import { prisma } from "@/lib/prisma";

// Für jetzt: Erste Organization als Default
// Später: Basierend auf Subdomain/Slug
export async function getPublicSettings() {
  // Hole die erste Organization (oder eine spezifische)
  const organization = await prisma.organization.findFirst({
    include: {
      settings: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!organization) {
    return null;
  }

  return {
    organizationId: organization.id,
    organizationName: organization.name,
    organizationSlug: organization.slug,
    settings: organization.settings,
  };
}

// Helper für Metadata Title
export function formatTitle(pageTitle: string, template: string): string {
  if (!template.includes("%s")) {
    return pageTitle;
  }
  return template.replace("%s", pageTitle);
}
