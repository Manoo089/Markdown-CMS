"use client";

import clsx from "clsx";
import {
  POST_TYPE_CONFIG,
  POST_STATUS_CONFIG,
  DEFAULT_BADGE_CONFIG,
  ROLE_CONFIG,
  type PostType,
  type PostStatus,
  type BadgeConfig,
} from "@/lib/constants";

type BadgeVariant = "type" | "status" | "role" | "generic";

type GenericVariant = "success" | "error" | "warning" | "info" | "neutral";

interface Props {
  value: PostType | PostStatus | string;
  variant?: BadgeVariant;
  color?: GenericVariant;
  className?: string;
}

const GENERIC_VARIANTS: Record<GenericVariant, BadgeConfig> = {
  success: {
    label: "",
    bgColor: "bg-badge-green-bg",
    textColor: "text-badge-green-text",
  },
  error: {
    label: "",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-200",
  },
  warning: {
    label: "",
    bgColor: "bg-badge-yellow-bg",
    textColor: "text-badge-yellow-text",
  },
  info: {
    label: "",
    bgColor: "bg-badge-blue-bg",
    textColor: "text-badge-blue-text",
  },
  neutral: {
    label: "",
    bgColor: "bg-badge-gray-bg",
    textColor: "text-badge-gray-text",
  },
};

export default function Badge({
  value,
  variant = "type",
  color = "neutral",
  className,
}: Props) {
  let config: BadgeConfig;

  if (variant === "status") {
    config = POST_STATUS_CONFIG[value as PostStatus] ?? DEFAULT_BADGE_CONFIG;
  } else if (variant === "role") {
    config = ROLE_CONFIG[value.toLocaleLowerCase()] ?? {
      lable: value,
      ...GENERIC_VARIANTS.neutral,
    };
  } else if (variant === "generic") {
    config = {
      ...GENERIC_VARIANTS[color],
      label: value,
    };
  } else {
    config = POST_TYPE_CONFIG[value as PostType] ?? DEFAULT_BADGE_CONFIG;
  }

  return (
    <span
      className={clsx(
        "px-2 py-1 rounded text-xs font-medium",
        config.bgColor,
        config.textColor,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
