import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const key = authHeader.replace("Bearer ", "");

  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: {
      organization: {
        include: {
          settings: true,
        },
      },
    },
  });

  if (!apiKey) {
    return { error: "Invalid API key", status: 401 };
  }

  // Update lastUsedAt
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(console.error);

  return {
    organization: apiKey.organization,
    settings: apiKey.organization.settings,
  };
}
