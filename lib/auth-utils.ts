import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthContext } from "./action-utils";

/**
 * Server-seitiger Auth-Check für protected pages
 * Wirft redirect() wenn nicht eingeloggt
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Auth-Check without redirect (return null)
 */
export async function getSession() {
  return await auth();
}

/**
 * Get AuthContext from session for authenticated actions
 * Returns null if user is not authenticated or missing required fields
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.organizationId) {
    return null;
  }

  return {
    userId: session.user.id,
    userEmail: session.user.email || "",
    organizationId: session.user.organizationId,
    isAdmin: session.user.isAdmin || false,
  };
}
