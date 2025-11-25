"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import {
  updatePasswordSchema,
  updateProfileSchema,
} from "@/lib/schemas/user.schema";

export async function updateProfile(data: unknown) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Zod Validation
    const validation = updateProfileSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { name, email } = validation.data;

    // Prüfen ob Email bereits vergeben ist (außer eigene)
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return { error: "Email is already in use" };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        email,
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}

type ActionResult =
  | { success: true }
  | { error: string }
  | { errors: string[] };

export async function updatePassword(data: unknown): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Zod Validation
    const validation = updatePasswordSchema.safeParse(data);

    if (!validation.success) {
      // Alle Fehler zurückgeben (für besseres UX)
      const errors = validation.error.issues.map((issue) => issue.message);
      return { errors };
    }

    const { currentPassword, newPassword } = validation.data;

    // User mit aktuellem Passwort laden
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return { error: "User not found" };
    }

    // Aktuelles Passwort prüfen
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return { error: "Current password is incorrect" };
    }

    // Neues Passwort hashen und speichern
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update password:", error);
    return { error: "Failed to update password. Please try again." };
  }
}
