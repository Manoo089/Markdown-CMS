/**
 * Message/Alert Components
 *
 * Reusable components for displaying errors, success messages, and alerts
 */

import { Message, MessageType } from "@/hooks/useActionState";
import clsx from "clsx";

// ============================================================================
// MESSAGE ALERT COMPONENT
// ============================================================================

interface MessageAlertProps {
  message: Message | null;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Display a message alert with appropriate styling
 *
 * @example
 * ```tsx
 * <MessageAlert
 *   message={message}
 *   onDismiss={() => setMessage(null)}
 * />
 * ```
 */
export function MessageAlert({
  message,
  onDismiss,
  className,
}: MessageAlertProps) {
  if (!message) return null;

  const styles = getMessageStyles(message.type);

  return (
    <div className={clsx(styles.container, className)} role="alert">
      <div className="flex items-start">
        <div className="shrink-0">{styles.icon}</div>
        <div className="ml-3 flex-1">
          <p className={styles.text}>{message.text}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={clsx(styles.closeButton, "ml-3")}
            aria-label="Dismiss"
          >
            <span className="leading-none" aria-hidden="true">
              ×
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// INLINE FIELD ERROR COMPONENT
// ============================================================================

interface FieldErrorProps {
  error?: string;
  className?: string;
}

/**
 * Display an inline field error message
 *
 * @example
 * ```tsx
 * <InputField ... />
 * <FieldError error={fieldErrors.email} />
 * ```
 */
export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p
      className={clsx("text-sm text-red-600 dark:text-red-400 mt-1", className)}
    >
      {error}
    </p>
  );
}

// ============================================================================
// ERROR LIST COMPONENT
// ============================================================================

interface ErrorListProps {
  errors: string[];
  title?: string;
  className?: string;
}

/**
 * Display a list of errors
 *
 * @example
 * ```tsx
 * <ErrorList
 *   errors={errors}
 *   title="Please fix the following errors:"
 * />
 * ```
 */
export function ErrorList({ errors, title, className }: ErrorListProps) {
  if (!errors || errors.length === 0) return null;

  return (
    <div
      className={clsx(
        "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4",
        className,
      )}
      role="alert"
    >
      {title && (
        <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
          {title}
        </h4>
      )}
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-sm text-red-700 dark:text-red-300">
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// LOADING STATE COMPONENT
// ============================================================================

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Display a loading spinner with optional message
 *
 * @example
 * ```tsx
 * {isLoading && <LoadingState message="Saving..." />}
 * ```
 */
export function LoadingState({
  message = "Loading...",
  size = "md",
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={clsx("flex items-center justify-center gap-3", className)}>
      <div
        className={clsx(
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
          sizeClasses[size],
        )}
        role="status"
        aria-label="Loading"
      />
      {message && <span className="text-sm text-text-muted">{message}</span>}
    </div>
  );
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Display an empty state with optional action
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No posts found"
 *   description="Create your first post to get started"
 *   action={<Button href="/posts/new" label="Create Post" />}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "text-center py-12 px-4 bg-surface rounded-lg border border-border",
        className,
      )}
    >
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted mb-6">{description}</p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getMessageStyles(type: MessageType) {
  const baseContainer =
    "rounded-lg p-4 border flex items-start transition-all duration-200";
  const baseText = "text-sm font-medium";
  const baseCloseButton =
    "absolute right-0 top-0 inline-flex rounded-md pt-1 pb-1 pr-1 pl-1 mr-2 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  switch (type) {
    case "success":
      return {
        container: clsx(
          baseContainer,
          "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
        ),
        text: clsx(baseText, "text-green-800 dark:text-green-200"),
        icon: (
          <svg
            className="h-5 w-5 text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ),
        closeButton: clsx(
          baseCloseButton,
          "absolute text-green-500 hover:bg-green-100 dark:hover:bg-green-900 focus:ring-green-600",
        ),
      };

    case "error":
      return {
        container: clsx(
          baseContainer,
          "relative bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
        ),
        text: clsx(baseText, "text-red-800 dark:text-red-200"),
        icon: (
          <svg
            className="h-5 w-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ),
        closeButton: clsx(
          baseCloseButton,
          "text-red-500 hover:bg-red-100 dark:hover:bg-red-900 focus:ring-red-600",
        ),
      };

    case "warning":
      return {
        container: clsx(
          baseContainer,
          "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
        ),
        text: clsx(baseText, "text-yellow-800 dark:text-yellow-200"),
        icon: (
          <svg
            className="h-5 w-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
        closeButton: clsx(
          baseCloseButton,
          "text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 focus:ring-yellow-600",
        ),
      };

    case "info":
      return {
        container: clsx(
          baseContainer,
          "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
        ),
        text: clsx(baseText, "text-blue-800 dark:text-blue-200"),
        icon: (
          <svg
            className="h-5 w-5 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        ),
        closeButton: clsx(
          baseCloseButton,
          "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 focus:ring-blue-600",
        ),
      };
  }
}
