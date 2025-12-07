/**
 * Dashboard Layout
 *
 * Shared layout for all authenticated dashboard pages.
 * Includes navigation and authentication check.
 */

import { auth } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import Button from "@/ui/Button";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/ModeToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation>
        <h1 className="text-xl font-bold">MDCMS Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button
            href="/settings"
            label="Site Settings"
            variant="plain"
            color="secondary"
            className="text-sm"
          />

          <ModeToggle />

          <UserMenu
            name={session?.user.name ?? ""}
            email={session?.user.email ?? ""}
          />
        </div>
      </Navigation>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
