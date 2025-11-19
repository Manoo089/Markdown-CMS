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
