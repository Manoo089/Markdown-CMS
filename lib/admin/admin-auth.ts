import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Admin Authentication Utilities
 *
 * For Server Components (Pages): Use requireAdmin() - it redirects unauthorized users
 * For Server Actions: Use adminAction() from lib/action-utils.ts - it returns ActionResult
 */

/**
 * Require admin access for a page (Server Component)
 * Redirects to /login if not authenticated, or /dashboard if not admin
 *
 * @example
 * ```typescript
 * // In a Server Component (page.tsx)
 * export default async function AdminPage() {
 *   const session = await requireAdmin();
 *   // ... rest of page
 * }
 * ```
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Prüfen ob User Admin ist
  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    // Nicht-Admins zum Dashboard redirecten
    redirect("/dashboard");
  }

  return session;
}

/**
 * Check if current user is admin without redirect
 * Useful for conditional rendering in components
 *
 * @example
 * ```typescript
 * const showAdminLink = await isAdmin();
 * ```
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  return user?.isAdmin ?? false;
}
