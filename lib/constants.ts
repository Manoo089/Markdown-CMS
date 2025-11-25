export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || "MDCMS Hohenadl Development";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "A Content-Management-System with Markdown for clients by Hohenadl Development.";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * Number of posts displayed per page in dashboard
 * @default 10
 */
export const POSTS_PER_PAGE = 10;

/**
 * Content Types in create/edit posts
 */
export const contentTypeOptions = [
  {
    value: "post",
    label: "Blog Post",
    description: "Regular blog post for /blog",
  },
  {
    value: "page",
    label: "Page",
    description: "Static page content (e.g., homepage sections)",
  },
  {
    value: "service",
    label: "Service",
    description: "Service offering for homepage",
  },
];

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
