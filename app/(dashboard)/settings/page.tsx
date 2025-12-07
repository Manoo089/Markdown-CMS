import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { SettingsForm } from "./settings-form";
import { ApiKeys } from "./api-keys";
import { Box } from "@/ui/Box";

export const metadata: Metadata = {
  title: "Site Settings",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Settings für diese Organization laden
  const settings = await prisma.siteSettings.findUnique({
    where: { organizationId: session.user.organizationId },
  });

  // API Keys laden
  const apiKeys = await prisma.apiKey.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-text-muted mt-2">
          Configure your website appearance and SEO
        </p>
      </div>

      <Box>
        <SettingsForm settings={settings} />
        <ApiKeys apiKeys={apiKeys} />
      </Box>
    </>
  );
}
