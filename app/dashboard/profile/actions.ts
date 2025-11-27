"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import {
  updatePasswordSchema,
  updateProfileSchema,
} from "@/lib/schemas/user.schema";
// ✅ NEU: Error-Handling System
import { createAuthenticatedAction, AuthContext } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode } from "@/lib/errors";

// ============================================================================
// HELPER: GET AUTH CONTEXT
// ============================================================================

async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    userId: session.user.id,
    userEmail: session.user.email,
    organizationId: session.user.organizationId || "",
    isAdmin: session.user.isAdmin || false,
  };
}

// ============================================================================
// UPDATE PROFILE ACTION
// ============================================================================

type UpdateProfileInput = {
  name: string | null;
  email: string;
};

export async function updateProfile(
  input: unknown,
): Promise<ActionResult<void>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  // createAuthenticatedAction macht Validierung automatisch
  const action = createAuthenticatedAction<UpdateProfileInput>(
    updateProfileSchema,
    async (data, auth) => {
      // Prüfen ob Email bereits vergeben ist (außer eigene)
      if (data.email !== auth.userEmail) {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (existingUser) {
          throw new Error("Email is already in use");
        }
      }

      // Update user
      await prisma.user.update({
        where: { id: auth.userId },
        data: {
          name: data.name || null,
          email: data.email,
        },
      });

      // Revalidate paths
      revalidatePath("/dashboard/profile");
      revalidatePath("/dashboard");
    },
  );

  return action(input, authContext);
}

// ============================================================================
// UPDATE PASSWORD ACTION
// ============================================================================

type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export async function updatePassword(
  input: unknown,
): Promise<ActionResult<void>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  // ✅ NEU: createAuthenticatedAction macht Validierung automatisch
  const action = createAuthenticatedAction<UpdatePasswordInput>(
    updatePasswordSchema,
    async (data, auth) => {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { password: true },
      });

      if (!user || !user.password) {
        throw new Error("User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: auth.userId },
        data: { password: hashedPassword },
      });
    },
  );

  return action(input, authContext);
}
