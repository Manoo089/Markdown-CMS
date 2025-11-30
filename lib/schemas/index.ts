/**
 * Schema Index
 *
 * Centralized exports for all Zod schemas
 * Import from here to keep imports clean
 */

// Organization Schemas
export {
  createOrganizationSchema,
  updateOrganizationSchema,
  deleteOrganizationSchema,
  addUserToOrganizationSchema,
  deleteUserSchema,
  toggleUserAdminSchema,
  organizationSlugSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
  type DeleteOrganizationInput,
  type AddUserToOrganizationInput,
  type DeleteUserInput,
  type ToggleUserAdminInput,
} from "./organization.schema";

// Post Schemas
export {
  createPostSchema,
  createPostSchemaForOrg,
  updatePostSchema,
  deletePostSchema,
  postTypeEnum,
  type CreatePostInput,
  type UpdatePostInput,
  type DeletePostInput,
  type PostType,
} from "./post.schema";

// Settings Schemas
export {
  updateSettingsSchema,
  parseAllowedOrigins,
  validateAllowedOrigins,
  type UpdateSettingsInput,
} from "./settings.schema";

// User Schemas
export {
  updatePasswordSchema,
  updateProfileSchema,
  passwordSchema,
  PASSWORD_MIN_LENGTH,
  PASSWORD_SPECIAL_CHAR_REGEX,
  type UpdatePasswordInput,
  type UpdateProfileInput,
} from "./user.schema";
