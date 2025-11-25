import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { withCors, handleOptions } from "@/lib/api-cors";

// Handle OPTIONS preflight
export async function OPTIONS(request: NextRequest) {
  const auth = await validateApiKey(request);
  const origin = request.headers.get("origin") || undefined;

  if ("error" in auth) {
    return handleOptions(origin, "*");
  }

  return handleOptions(origin, auth.settings?.allowedOrigins);
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin") || undefined;

  // Auth
  const auth = await validateApiKey(request);

  if ("error" in auth) {
    return withCors(
      NextResponse.json({ error: auth.error }, { status: auth.status }),
      origin,
      "*",
    );
  }

  const { organization, settings } = auth;

  if (!settings) {
    return withCors(
      NextResponse.json({ error: "Settings not found" }, { status: 404 }),
      origin,
      "*",
    );
  }

  return withCors(
    NextResponse.json({
      data: {
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
      },
    }),
    origin,
    settings.allowedOrigins,
  );
}
