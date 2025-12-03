import { apiRoute, apiOptions, apiSuccess, apiNotFound } from "@/lib/api-utils";

export const OPTIONS = apiOptions();

export const GET = apiRoute(async (request, { organization, settings }) => {
  if (!settings) {
    return apiNotFound("Settings");
  }

  return apiSuccess({
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
    settings: {
      siteTitle: settings.siteTitle,
      faviconUrl: settings.faviconUrl,
      logoUrl: settings.logoUrl,
      seoTitleTemplate: settings.seoTitleTemplate,
      seoDefaultDescription: settings.seoDefaultDescription,
      ogImageUrl: settings.ogImageUrl,
    },
  });
});
