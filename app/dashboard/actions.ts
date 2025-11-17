"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { signOut } from "@/lib/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
}

export async function deletePost(postId: string) {
  try {
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
