import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { withCors, handleOptions } from "@/lib/api-cors";

// Handle OPTIONS preflight
export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: NextRequest) {
  // Auth
  const auth = await validateApiKey(request);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organization } = auth;

  // Fetch settings
  const settings = await prisma.siteSettings.findUnique({
    where: { organizationId: organization.id },
    select: {
      siteTitle: true,
      faviconUrl: true,
      logoUrl: true,
      seoTitleTemplate: true,
      seoDefaultDescription: true,
      ogImageUrl: true,
    },
  });

  if (!settings) {
    return withCors(NextResponse.json({ error: "Settings not found" }, { status: 404 }));
  }

  return withCors(
    NextResponse.json({
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
        settings,
      },
    })
  );
}
