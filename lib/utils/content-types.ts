/**
 * Content Type Utilities
 *
 * Helper functions for working with organization-specific content types
 */

import { unstable_cache } from "next/cache";
import {
  ContentTypeConfig,
  ContentTypeDefinition,
  DEFAULT_CONTENT_TYPES,
} from "@/types/content-type";

// ============================================================================
// CACHED CONTENT TYPE CONFIG
// ============================================================================

/**
 * Get content type config for an organization with caching
 *
 * Uses Next.js unstable_cache for automatic caching and revalidation.
 * Cache expires after 60 seconds or when paths are revalidated.
 *
 * @param organizationId - Organization ID to get config for
 * @returns Parsed content type config
 *
 * @example
 * ```typescript
 * // In a Server Component or Action
 * const config = await getContentTypeConfig(organizationId);
 * ```
 */
export async function getContentTypeConfig(
  organizationId: string,
): Promise<ContentTypeConfig> {
  const getCachedConfig = unstable_cache(
    async (orgId: string) => {
      const { prisma } = await import("@/lib/prisma");

      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { contentTypeConfig: true },
      });

      if (!org) {
        console.warn(`Organization ${orgId} not found, using default config`);
        return DEFAULT_CONTENT_TYPES;
      }

      return parseContentTypeConfig(org.contentTypeConfig);
    },
    [`content-type-config-${organizationId}`],
    {
      revalidate: 60, // Cache for 60 seconds
    },
  );

  return getCachedConfig(organizationId);
}

/**
 * Invalidate content type config cache for an organization
 *
 * Call this after updating content types to ensure fresh data.
 * Uses revalidatePath to invalidate all pages using the config.
 *
 * @param organizationId - Organization ID to invalidate cache for
 *
 * @example
 * ```typescript
 * await updateContentType(data);
 * await invalidateContentTypeCache(organizationId);
 * ```
 */
export async function invalidateContentTypeCache(): Promise<void> {
  const { revalidatePath } = await import("next/cache");
  // Revalidate dashboard paths that use content type config
  revalidatePath("/dashboard/posts/new");
  revalidatePath("/dashboard/posts", "layout");
}

// ============================================================================
// PARSING UTILITIES
// ============================================================================

/**
 * Parse content type config from JSON string
 * Returns default config if parsing fails
 *
 * @param configJson - JSON string from database
 * @returns Parsed config or default config
 */
export function parseContentTypeConfig(
  configJson?: string | null,
): ContentTypeConfig {
  if (!configJson) {
    return DEFAULT_CONTENT_TYPES;
  }

  try {
    const parsed = JSON.parse(configJson);

    // Validate structure
    if (!parsed.types || !Array.isArray(parsed.types)) {
      console.warn("Invalid content type config structure, using defaults");
      return DEFAULT_CONTENT_TYPES;
    }

    // Ensure at least one type exists
    if (parsed.types.length === 0) {
      console.warn("Empty content type config, using defaults");
      return DEFAULT_CONTENT_TYPES;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse content type config:", error);
    return DEFAULT_CONTENT_TYPES;
  }
}

/**
 * Get array of allowed type values for an organization
 *
 * @param config - Content type configuration
 * @returns Array of type values (e.g., ["post", "page", "service"])
 */
export function getAllowedTypeValues(config: ContentTypeConfig): string[] {
  return config.types.map((t) => t.value);
}

/**
 * Check if a type value is allowed for an organization
 *
 * @param type - Type value to check
 * @param config - Content type configuration
 * @returns True if type is allowed
 */
export function isTypeAllowed(
  type: string,
  config: ContentTypeConfig,
): boolean {
  return getAllowedTypeValues(config).includes(type);
}

/**
 * Get type definition by value
 *
 * @param type - Type value to find
 * @param config - Content type configuration
 * @returns Type definition or undefined
 */
export function getTypeDefinition(
  type: string,
  config: ContentTypeConfig,
): ContentTypeDefinition | undefined {
  return config.types.find((t) => t.value === type);
}

/**
 * Serialize content type config to JSON string
 *
 * @param config - Content type configuration
 * @returns JSON string for database storage
 */
export function serializeContentTypeConfig(config: ContentTypeConfig): string {
  return JSON.stringify(config);
}

/**
 * Validate content type config structure
 *
 * @param config - Config to validate
 * @returns True if valid
 */
export function isValidContentTypeConfig(
  config: unknown,
): config is ContentTypeConfig {
  if (!config || typeof config !== "object") {
    return false;
  }

  const cfg = config as Record<string, unknown>;

  if (!Array.isArray(cfg.types)) {
    return false;
  }

  // Validate each type
  return cfg.types.every((type: unknown) => {
    if (!type || typeof type !== "object") {
      return false;
    }

    const t = type as Record<string, unknown>;

    return (
      typeof t.value === "string" &&
      t.value.length > 0 &&
      typeof t.label === "string" &&
      t.label.length > 0
    );
  });
}
