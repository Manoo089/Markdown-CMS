/**
 * Dashboard Layout
 *
 * Shared layout for all authenticated dashboard pages.
 * Includes header and sidebar navigation.
 * Auth is handled by proxy.ts.
 */

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin/admin-auth";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userIsAdmin = await isAdmin();

  return (
    <DashboardShell
      userName={session?.user.name ?? ""}
      userEmail={session?.user.email ?? ""}
      isAdmin={userIsAdmin}
    >
      {children}
    </DashboardShell>
  );
}
