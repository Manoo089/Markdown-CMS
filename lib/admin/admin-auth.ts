import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Prüft ob der aktuelle User Admin ist
 * Wirft Redirect wenn nicht authenticated oder kein Admin
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
 * Prüft ob User Admin ist ohne Redirect
 * Nützlich für Conditional Rendering
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
