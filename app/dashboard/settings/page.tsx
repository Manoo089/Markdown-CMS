import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

import { SettingsForm } from "./settings-form";
import { ApiKeys } from "./api-keys";
import Button from "@/ui/Button";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Site Settings",
};

export default async function SettingsPage() {
  const session = await requireAuth();

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
    <div className="min-h-screen bg-background">
      <Navigation>
        <div className="flex items-center gap-4">
          <Button
            href="/dashboard"
            label="← Back to Dashboard"
            variant="plain"
            color="secondary"
          />
        </div>
      </Navigation>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-text-muted mt-2">
            Configure your website appearance and SEO
          </p>
        </div>

        <SettingsForm settings={settings} />
        <ApiKeys apiKeys={apiKeys} />
      </main>
    </div>
  );
}
