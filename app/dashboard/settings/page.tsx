import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

import { SettingsForm } from "./settings-form";
import { ApiKeys } from "./api-keys";
import Button from "@/ui/Button";

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Button href="/dashboard" label="← Back to Dashboard" variant="plain" color="secondary" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-gray-600 mt-2">Configure your website appearance and SEO</p>
        </div>

        <SettingsForm settings={settings} />
        <ApiKeys apiKeys={apiKeys} />
      </main>
    </div>
  );
}
