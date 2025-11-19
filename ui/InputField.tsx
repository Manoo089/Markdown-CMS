import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { inputBaseStyles, inputCoreStyles } from "./shared/fieldStyles";
import { BaseInputProps } from "@/types/form";

type InputFieldTypes = "text" | "email" | "password" | "url";

interface Props extends BaseInputProps {
  startAddon?: string;
  type: InputFieldTypes;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({
  advancedLabel,
  className,
  id,
  description,
  disabled,
  fullWidth,
  label,
  placeholder,
  required,
  startAddon,
  type,
  value,
  onChange,
}: Props) {
  return (
    <div className={className}>
      <label htmlFor={id} className={clsx("block text-sm font-medium text-gray-700", label.length > 0 && "mb-2")}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {advancedLabel && <span className="text-gray-500 text-xs ml-2">{advancedLabel}</span>}
      </label>

      {startAddon ? (
        <div className={clsx("flex", fullWidth && "w-full")}>
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {startAddon}
          </span>
          <input
            id={id}
            type={type}
            value={value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            onChange={onChange}
            className={twMerge(inputCoreStyles, "rounded-r-md flex-1")}
          />
        </div>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onChange={onChange}
          className={clsx(inputBaseStyles, fullWidth && "w-full")}
        />
      )}
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
}
