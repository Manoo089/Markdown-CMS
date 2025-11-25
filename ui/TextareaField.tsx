import clsx from "clsx";
import { inputBaseStyles } from "./shared/fieldStyles";
import { BaseInputProps } from "@/types/form";

interface Props extends BaseInputProps {
  isMarkdown?: boolean;
  rows?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function TextareaField({
  advancedLabel,
  className,
  description,
  disabled,
  fullWidth,
  id,
  isMarkdown,
  label,
  placeholder,
  required,
  rows,
  value,
  onChange,
}: Props) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={clsx(
          "block text-sm font-medium text-text",
          label.length > 0 && "mb-2",
        )}
      >
        {label}
        {required && <span className="text-danger ml-1">*</span>}
        {advancedLabel && (
          <span className="text-text-muted text-xs ml-2">{advancedLabel}</span>
        )}
      </label>

      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        required={required}
        rows={rows ?? 4}
        disabled={disabled}
        onChange={onChange}
        className={clsx(
          inputBaseStyles,
          fullWidth && "w-full",
          isMarkdown && "font-mono",
        )}
      />

      {description && (
        <p className="text-xs text-text-subtle mt-1">{description}</p>
      )}
    </div>
  );
}
