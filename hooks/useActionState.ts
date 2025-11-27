/**
 * Client-Side Error Handling Hooks
 *
 * React hooks for handling action results and displaying errors/success messages
 */

"use client";

import { useState, useCallback } from "react";
import {
  ActionResult,
  isSuccess,
  hasValidationErrors,
  hasFieldErrors,
} from "@/lib/errors";

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export type MessageType = "success" | "error" | "info" | "warning";

export type Message = {
  type: MessageType;
  text: string;
};

// ============================================================================
// ACTION STATE HOOK
// ============================================================================

/**
 * Hook for managing action state with loading, messages, and errors
 *
 * @example
 * ```typescript
 * const { execute, isLoading, message, fieldErrors } = useActionState(updateProfile);
 *
 * const handleSubmit = async (e) => {
 *   e.preventDefault();
 *   const success = await execute({ name, email });
 *   if (success) {
 *     router.push('/dashboard');
 *   }
 * };
 * ```
 */
export function useActionState<TInput, TOutput = void>() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = useCallback(() => {
    setMessage(null);
    setErrors([]);
    setFieldErrors({});
  }, []);

  const execute = useCallback(
    async (
      action: (input: TInput) => Promise<ActionResult<TOutput>>,
      input: TInput,
      options?: {
        onSuccess?: (data: TOutput extends void ? void : TOutput) => void;
        onError?: () => void;
        successMessage?: string;
      },
    ): Promise<boolean> => {
      setIsLoading(true);
      clearErrors();

      const result = await action(input);

      setIsLoading(false);

      if (isSuccess(result)) {
        // Handle success
        const successMsg = options?.successMessage || "Operation successful";
        setMessage({ type: "success", text: successMsg });

        if (options?.onSuccess) {
          const data = (
            "data" in result ? result.data : undefined
          ) as TOutput extends void ? void : TOutput;
          options.onSuccess(data);
        }

        return true;
      } else {
        // Handle errors
        if (hasFieldErrors(result)) {
          setFieldErrors(result.fieldErrors);
          setMessage({ type: "error", text: "Please fix the errors below" });
        } else if (hasValidationErrors(result)) {
          setErrors(result.errors);
          setMessage({ type: "error", text: result.errors[0] });
        } else if ("error" in result) {
          // ErrorResult - has single error message
          setMessage({ type: "error", text: result.error });
        } else {
          // Fallback for unexpected error format
          setMessage({ type: "error", text: "An error occurred" });
        }

        if (options?.onError) {
          options.onError();
        }

        return false;
      }
    },
    [clearErrors],
  );

  return {
    isLoading,
    message,
    errors,
    fieldErrors,
    clearErrors,
    execute,
  };
}

// ============================================================================
// SIMPLE MESSAGE HOOK
// ============================================================================

/**
 * Simple hook for displaying messages
 *
 * @example
 * ```typescript
 * const { message, showSuccess, showError } = useMessage();
 *
 * const handleSubmit = async () => {
 *   const result = await updateProfile(data);
 *   if (result.success) {
 *     showSuccess("Profile updated!");
 *   } else if ("error" in result) {
 *     showError(result.error);
 *   }
 * };
 * ```
 */
export function useMessage(autoHideDuration?: number) {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = useCallback(
    (type: MessageType, text: string) => {
      setMessage({ type, text });

      if (autoHideDuration) {
        setTimeout(() => setMessage(null), autoHideDuration);
      }
    },
    [autoHideDuration],
  );

  const showSuccess = useCallback(
    (text: string) => showMessage("success", text),
    [showMessage],
  );

  const showError = useCallback(
    (text: string) => showMessage("error", text),
    [showMessage],
  );

  const showInfo = useCallback(
    (text: string) => showMessage("info", text),
    [showMessage],
  );

  const showWarning = useCallback(
    (text: string) => showMessage("warning", text),
    [showMessage],
  );

  const clearMessage = useCallback(() => setMessage(null), []);

  return {
    message,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearMessage,
  };
}

// ============================================================================
// FORM ERROR HOOK
// ============================================================================

/**
 * Hook specifically for managing form validation errors
 *
 * @example
 * ```typescript
 * const { fieldErrors, setFieldError, getFieldError, hasError } = useFormErrors();
 *
 * const emailError = getFieldError('email');
 * ```
 */
export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return fieldErrors[field];
    },
    [fieldErrors],
  );

  const hasError = useCallback(
    (field: string): boolean => {
      return !!fieldErrors[field];
    },
    [fieldErrors],
  );

  const setErrors = useCallback((errors: Record<string, string>) => {
    setFieldErrors(errors);
  }, []);

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasError,
    setErrors,
  };
}

// ============================================================================
// ASYNC ACTION HOOK
// ============================================================================

/**
 * Hook for executing async actions with loading state
 * Simplified version without validation error handling
 *
 * @example
 * ```typescript
 * const { execute, isLoading, error } = useAsyncAction();
 *
 * const handleDelete = () => {
 *   execute(async () => {
 *     await deletePost(postId);
 *     router.push('/dashboard');
 *   });
 * };
 * ```
 */
export function useAsyncAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (action: () => Promise<void>) => {
    setIsLoading(true);
    setError(null);

    try {
      await action();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    execute,
    clearError,
  };
}
