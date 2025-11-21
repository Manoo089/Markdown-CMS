"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

type UpdateProfileInput = {
  name: string;
  email: string;
};

type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export async function updateProfile(data: UpdateProfileInput) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    if (data.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return { error: "Email is already in use" };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name || null,
        email: data.email,
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

export async function updatePassword(data: UpdatePasswordInput) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return { error: "User not found!" };
    }

    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return { error: "Current password is incorrect!" };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

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
