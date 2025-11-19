/**
 * Number of posts displayed per page in dashboard
 * @default 10
 */
export const POSTS_PER_PAGE = 10;

/**
 * Content Types in create/edit posts
 */
export const contentTypeOptions = [
  { value: "post", label: "Blog Post", description: "Regular blog post for /blog" },
  { value: "page", label: "Page", description: "Static page content (e.g., homepage sections)" },
  { value: "service", label: "Service", description: "Service offering for homepage" },
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
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  },
  page: {
    label: "Page",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  service: {
    label: "Service",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
  },
};

/**
 * Status Configuration for Badges
 */
export type PostStatus = "published" | "draft";

export const POST_STATUS_CONFIG: Record<PostStatus, BadgeConfig> = {
  published: {
    label: "Published",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  draft: {
    label: "Draft",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
};

/**
 * Default fallback for unknown types
 */
export const DEFAULT_BADGE_CONFIG: BadgeConfig = {
  label: "Unknown",
  bgColor: "bg-gray-100",
  textColor: "text-gray-800",
};