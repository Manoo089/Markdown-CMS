/**
 * Constants Index - Barrel Export
 *
 * Centralized export for all application constants.
 * Import from here to keep imports clean and consistent.
 *
 * @example
 * ```typescript
 * import { APP_NAME, contentTypeOptions, POSTS_PER_PAGE } from "@/lib/constants";
 * ```
 */

// App Configuration
export * from "./app";

// Content Types
export * from "./content-type-options";
export * from "./post-type-badges";

// Pagination
export * from "./posts-per-page";

// Table Configurations
export * from "./organization-table-columns";
export * from "./user-table-columns";
