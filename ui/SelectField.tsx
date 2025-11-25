import clsx from "clsx";
import { inputBaseStyles } from "./shared/fieldStyles";
import { BaseFieldProps } from "@/types/form";

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface Props extends BaseFieldProps {
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function SelectField({
  advancedLabel,
  className,
  description,
  disabled,
  fullWidth,
  id,
  label,
  options,
  required,
  value,
  onChange,
}: Props) {
  const selectedOption = options.find((opt) => opt.value === value);

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
          <span className="text-text-subtle text-xs ml-2">{advancedLabel}</span>
        )}
      </label>

      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={clsx(inputBaseStyles, "bg-surface", fullWidth && "w-full")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {selectedOption?.description && (
        <p className="text-xs text-gray-500 mt-1">
          {selectedOption.description}
        </p>
      )}

      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}
