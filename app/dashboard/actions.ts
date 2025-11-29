"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { signOut } from "@/lib/auth";
import { getAuthContext } from "@/lib/auth-utils";
import { createAuthenticatedAction } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode } from "@/lib/errors";
import { deletePostSchema, type DeletePostInput } from "@/lib/schemas";

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
}

export async function deletePost(input: unknown): Promise<ActionResult<void>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<DeletePostInput, void>(
    deletePostSchema,
    async (data, auth) => {
      const post = await prisma.post.findUnique({
        where: { id: data.postId },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      if (post.organizationId !== auth.organizationId) {
        throw new Error("You don't have permission to delete this post");
      }

      // Post löschen
      await prisma.post.delete({
        where: { id: data.postId },
      });

      revalidatePath("/dashbaord");
    },
  );

  return action(input, authContext);
}
