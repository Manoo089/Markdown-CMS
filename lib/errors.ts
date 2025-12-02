/**
 * Central Error Handling System
 *
 * This module provides a consistent way to handle errors across the application.
 * It includes type-safe error responses, error codes, and utility functions.
 */

import { ZodError } from "zod";

// ============================================================================
// ERROR CODES
// ============================================================================

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Database & Resources
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  DATABASE_ERROR = "DATABASE_ERROR",

  // Business Logic
  OPERATION_FAILED = "OPERATION_FAILED",
  CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",

  // Server
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

// ============================================================================
// RESULT TYPES
// ============================================================================

/**
 * Success result for operations that return data
 */
export type SuccessResult<T> = {
  success: true;
  data: T;
};

/**
 * Success result for operations without return data
 */
export type SuccessResultVoid = {
  success: true;
};

/**
 * Error result with a single error message
 */
export type ErrorResult = {
  success: false;
  error: string;
  code?: ErrorCode;
};

/**
 * Error result with multiple validation errors
 */
export type ValidationErrorResult = {
  success: false;
  errors: string[];
  code: ErrorCode.VALIDATION_ERROR;
};

/**
 * Field-specific validation errors
 */
export type FieldErrorResult = {
  success: false;
  fieldErrors: Record<string, string>;
  code: ErrorCode.VALIDATION_ERROR;
};

/**
 * Generic action result type
 */
export type ActionResult<T = void> =
  | (T extends void ? SuccessResultVoid : SuccessResult<T> | SuccessResultVoid)
  | ErrorResult
  | ValidationErrorResult
  | FieldErrorResult;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if result is successful
 */
export function isSuccess<T>(
  result: ActionResult<T>,
): result is Extract<ActionResult<T>, { success: true }> {
  return result.success === true;
}

/**
 * Check if result is an error
 */
export function isError<T>(
  result: ActionResult<T>,
): result is Extract<ActionResult<T>, { success: false }> {
  return result.success === false;
}

/**
 * Check if result has validation errors (array)
 */
export function hasValidationErrors<T>(
  result: ActionResult<T>,
): result is Extract<ActionResult<T>, { errors: string[] }> {
  return !result.success && "errors" in result && Array.isArray(result.errors);
}

/**
 * Check if result has field-specific errors
 */
export function hasFieldErrors<T>(
  result: ActionResult<T>,
): result is Extract<ActionResult<T>, { fieldErrors: Record<string, string> }> {
  return (
    !result.success &&
    "fieldErrors" in result &&
    typeof result.fieldErrors === "object"
  );
}

/**
 * Get error message from any error result type
 * Converts all error types to a user-friendly string message
 */
export function getErrorMessage<T>(result: ActionResult<T>): string | null {
  if (!isError(result)) {
    return null;
  }

  // Single error message
  if ("error" in result) {
    return result.error;
  }

  // Multiple validation errors
  if ("errors" in result && Array.isArray(result.errors)) {
    return result.errors.join(", ");
  }

  // Field-specific errors
  if ("fieldErrors" in result) {
    const messages = Object.values(result.fieldErrors);
    return messages.join(", ");
  }

  return "An unknown error occurred";
}

// ============================================================================
// ERROR CREATORS
// ============================================================================

/**
 * Create a success result with data
 */
export function success<T>(data: T): SuccessResult<T> {
  return { success: true, data };
}

/**
 * Create a success result without data
 */
export function successVoid(): SuccessResultVoid {
  return { success: true };
}

/**
 * Create an error result with a message
 */
export function error(
  message: string,
  code: ErrorCode = ErrorCode.OPERATION_FAILED,
): ErrorResult {
  return { success: false, error: message, code };
}

/**
 * Create a validation error result with multiple errors
 */
export function validationErrors(errors: string[]): ValidationErrorResult {
  return {
    success: false,
    errors,
    code: ErrorCode.VALIDATION_ERROR,
  };
}

export function validationError(err: ZodError): FieldErrorResult {
  return handleZodError(err);
}

/**
 * Create a field error result with field-specific errors
 */
export function fieldErrors(
  fieldErrors: Record<string, string>,
): FieldErrorResult {
  return {
    success: false,
    fieldErrors,
    code: ErrorCode.VALIDATION_ERROR,
  };
}

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * Handle unknown errors and convert them to ActionResult
 */
export function handleError(err: unknown, context?: string): ErrorResult {
  // Log error for debugging
  console.error(`[Error${context ? ` in ${context}` : ""}]:`, err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const firstError = err.issues[0];
    return error(firstError.message, ErrorCode.VALIDATION_ERROR);
  }

  // Handle known error types
  if (err instanceof Error) {
    // Check for specific error patterns
    if (err.message.includes("Unique constraint")) {
      return error("This record already exists", ErrorCode.ALREADY_EXISTS);
    }

    if (err.message.includes("Foreign key constraint")) {
      return error(
        "Cannot perform this operation due to related records",
        ErrorCode.CONSTRAINT_VIOLATION,
      );
    }

    // Generic error message
    return error(err.message, ErrorCode.INTERNAL_ERROR);
  }

  // Unknown error type
  return error("An unexpected error occurred", ErrorCode.INTERNAL_ERROR);
}

/**
 * Handle Zod validation errors and convert to field errors
 */
export function handleZodError(err: ZodError): FieldErrorResult {
  const fieldErrors: Record<string, string> = {};

  err.issues.forEach((error) => {
    const path = error.path.join(".");
    if (path) {
      fieldErrors[path] = error.message;
    }
  });

  return {
    success: false,
    fieldErrors,
    code: ErrorCode.VALIDATION_ERROR,
  };
}

// ============================================================================
// COMMON ERROR MESSAGES
// ============================================================================

export const ErrorMessages = {
  // Auth
  UNAUTHORIZED: "You must be logged in to perform this action",
  FORBIDDEN: "You don't have permission to perform this action",
  INVALID_CREDENTIALS: "Invalid email or password",
  SESSION_EXPIRED: "Your session has expired. Please log in again",

  // Validation
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_FORMAT: (field: string) => `${field} has an invalid format`,
  TOO_SHORT: (field: string, min: number) =>
    `${field} must be at least ${min} characters`,
  TOO_LONG: (field: string, max: number) =>
    `${field} must be no more than ${max} characters`,

  // Database
  NOT_FOUND: (resource: string) => `${resource} not found`,
  ALREADY_EXISTS: (resource: string) => `${resource} already exists`,
  DELETE_FAILED: (resource: string) => `Failed to delete ${resource}`,
  UPDATE_FAILED: (resource: string) => `Failed to update ${resource}`,
  CREATE_FAILED: (resource: string) => `Failed to create ${resource}`,

  // Generic
  OPERATION_FAILED: "The operation failed. Please try again",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again later",
  SERVER_ERROR: "A server error occurred. Please try again later",
} as const;

// ============================================================================
// HTTP STATUS CODE MAPPING
// ============================================================================

/**
 * Map error codes to HTTP status codes (useful for API routes)
 */
export function getHttpStatus(code?: ErrorCode): number {
  switch (code) {
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.INVALID_CREDENTIALS:
    case ErrorCode.SESSION_EXPIRED:
      return 401;

    case ErrorCode.FORBIDDEN:
      return 403;

    case ErrorCode.NOT_FOUND:
      return 404;

    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.INVALID_INPUT:
    case ErrorCode.MISSING_REQUIRED_FIELD:
      return 400;

    case ErrorCode.ALREADY_EXISTS:
    case ErrorCode.CONSTRAINT_VIOLATION:
      return 409;

    case ErrorCode.SERVICE_UNAVAILABLE:
      return 503;

    case ErrorCode.INTERNAL_ERROR:
    case ErrorCode.DATABASE_ERROR:
    case ErrorCode.OPERATION_FAILED:
    default:
      return 500;
  }
}
