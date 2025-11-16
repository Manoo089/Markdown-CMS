import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

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
 * Optional: Auth-Check ohne Redirect (gibt null zurück)
 */
export async function getSession() {
  return await auth();
}
