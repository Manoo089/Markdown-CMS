"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateApiKey } from "@/lib/api-keys";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuthenticatedAction, AuthContext } from "@/lib/action-utils";
import { ActionResult, error, ErrorCode } from "@/lib/errors";

// ============================================================================
// HELPER: GET AUTH CONTEXT
// ============================================================================

async function getAuthContext(): Promise<AuthContext | null> {
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

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createApiKeySchema = z.string().min(1, "API key name is required");

const deleteApiKeySchema = z.string().min(1, "API key ID is required");

// ============================================================================
// CREATE API KEY ACTION
// ============================================================================

export async function createApiKey(
  input: unknown,
): Promise<ActionResult<string>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  const action = createAuthenticatedAction<string, string>(
    createApiKeySchema,
    async (name, auth) => {
      // Generate API key
      const key = generateApiKey();

      // Create in database
      const apiKey = await prisma.apiKey.create({
        data: {
          key,
          name,
          organizationId: auth.organizationId,
        },
      });

      // Revalidate settings page
      revalidatePath("/dashboard/settings");

      // Return the key - this is the only time it will be visible!
      return apiKey.key;
    },
  );

  return action(input, authContext);
}

// ============================================================================
// DELETE API KEY ACTION
// ============================================================================

export async function deleteApiKey(
  input: unknown,
): Promise<ActionResult<void>> {
  const authContext = await getAuthContext();

  if (!authContext) {
    return error("Unauthorized", ErrorCode.UNAUTHORIZED);
  }

  // ✅ NEU: createAuthenticatedAction macht Validierung automatisch
  const action = createAuthenticatedAction<string>(
    deleteApiKeySchema,
    async (keyId, auth) => {
      // Check if key exists and belongs to organization
      const apiKey = await prisma.apiKey.findUnique({
        where: { id: keyId },
        select: { organizationId: true },
      });

      if (!apiKey) {
        throw new Error("API key not found");
      }

      if (apiKey.organizationId !== auth.organizationId) {
        throw new Error("Unauthorized");
      }

      // Delete API key
      await prisma.apiKey.delete({
        where: { id: keyId },
      });

      // Revalidate settings page
      revalidatePath("/dashboard/settings");
    },
  );

  return action(input, authContext);
}
