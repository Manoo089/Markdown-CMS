/**
 * Post Type Configuration for Badges
 */
export type PostType = "post" | "page" | "service";

export interface BadgeConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

export const POST_TYPE_CONFIG: Record<PostType, BadgeConfig> = {
  post: {
    label: "Blog Post",
    bgColor: "bg-badge-gray-bg",
    textColor: "text-badge-gray-text",
  },
  page: {
    label: "Page",
    bgColor: "bg-badge-blue-bg",
    textColor: "text-badge-blue-text",
  },
  service: {
    label: "Service",
    bgColor: "bg-badge-purple-bg",
    textColor: "text-badge-purple-text",
  },
};

/**
 * Status Configuration for Badges
 */
export type PostStatus = "published" | "draft";

export const POST_STATUS_CONFIG: Record<PostStatus, BadgeConfig> = {
  published: {
    label: "Published",
    bgColor: "bg-badge-green-bg",
    textColor: "text-badge-green-text",
  },
  draft: {
    label: "Draft",
    bgColor: "bg-badge-yellow-bg",
    textColor: "text-badge-yellow-text",
  },
};

/**
 * Default fallback for unknown types
 */
export const DEFAULT_BADGE_CONFIG: BadgeConfig = {
  label: "Unknown",
  bgColor: "bg-badge-gray-bg",
  textColor: "text-badge-gray-text",
};

// Role-specific configs (for Admin)
export const ROLE_CONFIG: Record<string, BadgeConfig> = {
  admin: {
    label: "Admin",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-200",
  },
  user: {
    label: "User",
    bgColor: "bg-badge-blue-bg",
    textColor: "text-badge-blue-text",
  },
};
