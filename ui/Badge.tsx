import clsx from "clsx";
import {
  POST_TYPE_CONFIG,
  POST_STATUS_CONFIG,
  DEFAULT_BADGE_CONFIG,
  type PostType,
  type PostStatus,
  type BadgeConfig,
} from "@/lib/constants";

type BadgeVariant = "type" | "status";

interface Props {
  value: PostType | PostStatus | string;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ value, variant = "type", className }: Props) {
  let config: BadgeConfig;

  if (variant === "status") {
    config = POST_STATUS_CONFIG[value as PostStatus] ?? DEFAULT_BADGE_CONFIG;
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
