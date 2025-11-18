"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { signOut } from "@/lib/auth";
import { auth } from "@/lib/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
}

export async function deletePost(postId: string) {
  try {
    // Session holen für Organization-Check
    const session = await auth();

    if (!session?.user?.organizationId) {
      return { error: "Unauthorized" };
    }

    // Post holen und prüfen ob er zur Organization gehört
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { error: "Post not found" };
    }

    if (post.organizationId !== session.user.organizationId) {
      return { error: "Unauthorized" };
    }

    // Jetzt löschen
    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { error: "Failed to delete post" };
  }
}
