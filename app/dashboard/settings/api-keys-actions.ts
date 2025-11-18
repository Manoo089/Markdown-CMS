"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateApiKey } from "@/lib/api-keys";
import { revalidatePath } from "next/cache";

export async function createApiKey(name: string) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return { error: "Unauthorized" };
    }

    const key = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name,
        organizationId: session.user.organizationId,
      },
    });

    revalidatePath("/dashboard/settings");

    // Key nur einmal zurückgeben - danach nicht mehr sichtbar!
    return { success: true, key: apiKey.key, id: apiKey.id };
  } catch (error) {
    console.error("Failed to create API key:", error);
    return { error: "Failed to create API key" };
  }
}

export async function deleteApiKey(keyId: string) {
  try {
    const session = await auth();

    if (!session?.user?.organizationId) {
      return { error: "Unauthorized" };
    }

    // Prüfen ob Key zur Organization gehört
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.organizationId !== session.user.organizationId) {
      return { error: "Unauthorized" };
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return { error: "Failed to delete API key" };
  }
}
