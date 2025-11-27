/**
 * Server Action Utilities
 *
 * This module provides utilities for creating type-safe server actions
 * with automatic validation and error handling.
 */

import { ZodType } from "zod";
import {
  ActionResult,
  handleError,
  handleZodError,
  success,
  successVoid,
  ErrorCode,
  error,
} from "./errors";

// ============================================================================
// SERVER ACTION WRAPPER
// ============================================================================

/**
 * Create a type-safe server action with automatic validation and error handling
 *
 * @example
 * ```typescript
 * export const updateProfile = createAction(
 *   updateProfileSchema,
 *   async (data, context) => {
 *     const user = await prisma.user.update({
 *       where: { id: context.userId },
 *       data: { name: data.name, email: data.email }
 *     });
 *     return user;
 *   }
 * );
 * ```
 */
export function createAction<TInput, TOutput = void, TContext = void>(
  schema: ZodType<TInput>,
  handler: (
    validatedInput: TInput,
    context: TContext,
  ) => Promise<TOutput> | TOutput,
) {
  return async (
    input: unknown,
    context?: TContext,
  ): Promise<ActionResult<TOutput>> => {
    try {
      // Validate input
      const validation = schema.safeParse(input);

      if (!validation.success) {
        return handleZodError(validation.error) as ActionResult<TOutput>;
      }

      // Execute handler
      const result = await handler(validation.data, context as TContext);

      // Return success result
      if (result === undefined) {
        return successVoid() as ActionResult<TOutput>;
      }

      return success(result) as ActionResult<TOutput>;
    } catch (err) {
      // Handle unexpected errors
      return handleError(err, "Server Action") as ActionResult<TOutput>;
    }
  };
}

// ============================================================================
// AUTHENTICATED ACTION WRAPPER
// ============================================================================

/**
 * Context provided to authenticated actions
 */
export type AuthContext = {
  userId: string;
  userEmail: string;
  organizationId: string;
  isAdmin: boolean;
};

/**
 * Create a server action that requires authentication
 *
 * @example
 * ```typescript
 * export const createPost = createAuthenticatedAction(
 *   createPostSchema,
 *   async (data, auth) => {
 *     const post = await prisma.post.create({
 *       data: {
 *         ...data,
 *         authorId: auth.userId,
 *         organizationId: auth.organizationId,
 *       }
 *     });
 *     return post;
 *   }
 * );
 * ```
 */
export function createAuthenticatedAction<TInput, TOutput = void>(
  schema: ZodType<TInput>,
  handler: (validatedInput: TInput, auth: AuthContext) => Promise<TOutput>,
) {
  return async (
    input: unknown,
    auth?: AuthContext,
  ): Promise<ActionResult<TOutput>> => {
    try {
      // Check authentication
      if (!auth || !auth.userId) {
        return error(
          "You must be logged in to perform this action",
          ErrorCode.UNAUTHORIZED,
        ) as ActionResult<TOutput>;
      }

      // Validate input
      const validation = schema.safeParse(input);

      if (!validation.success) {
        return handleZodError(validation.error) as ActionResult<TOutput>;
      }

      // Execute handler
      const result = await handler(validation.data, auth);

      // Return success result
      if (result === undefined) {
        return successVoid() as ActionResult<TOutput>;
      }

      return success(result) as ActionResult<TOutput>;
    } catch (err) {
      return handleError(err, "Authenticated Action") as ActionResult<TOutput>;
    }
  };
}

// ============================================================================
// ADMIN ACTION WRAPPER
// ============================================================================

/**
 * Create a server action that requires admin privileges
 *
 * @example
 * ```typescript
 * export const deleteOrganization = createAdminAction(
 *   deleteOrgSchema,
 *   async (data) => {
 *     await prisma.organization.delete({
 *       where: { id: data.orgId }
 *     });
 *   }
 * );
 * ```
 */
export function createAdminAction<TInput, TOutput = void>(
  schema: ZodType<TInput>,
  handler: (validatedInput: TInput, auth: AuthContext) => Promise<TOutput>,
) {
  return async (
    input: unknown,
    auth?: AuthContext,
  ): Promise<ActionResult<TOutput>> => {
    try {
      // Check authentication
      if (!auth || !auth.userId) {
        return error(
          "You must be logged in to perform this action",
          ErrorCode.UNAUTHORIZED,
        ) as ActionResult<TOutput>;
      }

      // Check admin privileges
      if (!auth.isAdmin) {
        return error(
          "You don't have permission to perform this action",
          ErrorCode.FORBIDDEN,
        ) as ActionResult<TOutput>;
      }

      // Validate input
      const validation = schema.safeParse(input);

      if (!validation.success) {
        return handleZodError(validation.error) as ActionResult<TOutput>;
      }

      // Execute handler
      const result = await handler(validation.data, auth);

      // Return success result
      if (result === undefined) {
        return successVoid() as ActionResult<TOutput>;
      }

      return success(result) as ActionResult<TOutput>;
    } catch (err) {
      return handleError(err, "Admin Action") as ActionResult<TOutput>;
    }
  };
}

// ============================================================================
// SIMPLE ACTION WRAPPER (No validation)
// ============================================================================

/**
 * Create a simple server action without input validation
 * Useful for actions that don't require input or use their own validation
 *
 * @example
 * ```typescript
 * export const getCurrentUser = createSimpleAction(async () => {
 *   const session = await auth();
 *   return session?.user;
 * });
 * ```
 */
export function createSimpleAction<TOutput = void>(
  handler: () => Promise<TOutput> | TOutput,
) {
  return async (): Promise<ActionResult<TOutput>> => {
    try {
      const result = await handler();

      if (result === undefined) {
        return successVoid() as ActionResult<TOutput>;
      }

      return success(result) as ActionResult<TOutput>;
    } catch (err) {
      return handleError(err, "Simple Action") as ActionResult<TOutput>;
    }
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Wrap an existing async function with error handling
 * Useful for non-action functions that need consistent error handling
 */
export function withErrorHandling<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  context?: string,
) {
  return async (...args: TArgs): Promise<ActionResult<TReturn>> => {
    try {
      const result = await fn(...args);
      return success(result) as ActionResult<TReturn>;
    } catch (err) {
      return handleError(err, context) as ActionResult<TReturn>;
    }
  };
}
