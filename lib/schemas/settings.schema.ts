/**
 * Settings Schema Definitions
 *
 * Centralized Zod schemas for site settings operations
 */

import { z } from "zod";

// ============================================================================
// SETTINGS SCHEMA
// ============================================================================

/**
 * Site settings update schema
 * Handles all site configuration options
 */
export const updateSettingsSchema = z.object({
  // Core Settings
  siteTitle: z.string().min(1, "Site title is required"),
  faviconUrl: z.url("Invalid favicon URL").optional().or(z.literal("")),
  logoUrl: z.url("Invalid logo URL").optional().or(z.literal("")),

  // SEO Settings
  seoTitleTemplate: z.string().min(1, "SEO title template is required"),
  seoDefaultDescription: z.string().optional().or(z.literal("")),
  ogImageUrl: z.url("Invalid OG image URL").optional().or(z.literal("")),

  // API Settings
  allowedOrigins: z.string().optional().or(z.literal("")),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse comma-separated allowed origins
 * Returns array of trimmed, non-empty origins
 */
export function parseAllowedOrigins(allowedOrigins?: string | null): string[] {
  if (!allowedOrigins) return [];

  return allowedOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

/**
 * Validate allowed origins format
 * Each origin should be a valid URL
 */
export function validateAllowedOrigins(
  allowedOrigins?: string | null,
): boolean {
  if (!allowedOrigins) return true;

  const origins = parseAllowedOrigins(allowedOrigins);

  return origins.every((origin) => {
    try {
      new URL(origin);
      return true;
    } catch {
      return false;
    }
  });
}
