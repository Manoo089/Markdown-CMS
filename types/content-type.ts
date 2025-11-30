/**
 * Content Type Definitions
 *
 * Type definitions for organization-specific content types.
 * Each organization can define their own content types with custom labels,
 * descriptions, and visual properties.
 */

export interface ContentTypeDefinition {
  /** Unique value identifier (e.g., "post", "service", "menu-item") */
  value: string;

  /** Display label for the content type */
  label: string;

  /** Optional description explaining what this content type is for */
  description?: string;

  /** Optional emoji or icon identifier */
  icon?: string;

  /** Optional color for badges/UI (Tailwind color class) */
  color?: string;
}

export interface ContentTypeConfig {
  /** Array of available content types for this organization */
  types: ContentTypeDefinition[];
}

/**
 * Default content types for new organizations
 */
export const DEFAULT_CONTENT_TYPES: ContentTypeConfig = {
  types: [
    {
      value: "post",
      label: "Blog Post",
      description: "Regular blog post for /blog",
      icon: "📝",
    },
    {
      value: "page",
      label: "Page",
      description: "Static page content (e.g., homepage sections)",
      icon: "📄",
    },
    {
      value: "service",
      label: "Service",
      description: "Service offering for homepage",
      icon: "🛠️",
    },
  ],
};
