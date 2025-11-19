import clsx from "clsx";

type InputFieldTypes = "text" | "email" | "password" | "url";

interface BaseProps {
  advancedLabel?: string;
  id: string;
  description?: string;
  fullWidth?: boolean;
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
}

interface InputProps extends BaseProps {
  type: InputFieldTypes;
  isMarkdown?: never;
  rows?: never;
  startAddon?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TextareaProps extends BaseProps {
  type: "textarea";
  isMarkdown?: boolean;
  rows?: number;
  startAddon?: never;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

type Props = InputProps | TextareaProps;

export default function InputField({
  advancedLabel,
  id,
  description,
  fullWidth,
  isMarkdown,
  label,
  placeholder,
  required,
  startAddon,
  type,
  rows,
  value,
  onChange,
}: Props) {
  const baseInputClasses = "px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div>
      <label htmlFor={id} className={clsx("block text-sm font-medium text-gray-700", label.length > 0 && "mb-2")}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {advancedLabel && <span className="text-gray-500 text-xs ml-2">{advancedLabel}</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          required={required}
          rows={rows ?? 4}
          onChange={onChange}
          className={clsx(baseInputClasses, fullWidth && "w-full", isMarkdown && "font-mono")}
        />
      ) : startAddon ? (
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {startAddon}
          </span>
          <input
            id={id}
            type={type}
            value={value}
            placeholder={placeholder}
            required={required}
            onChange={onChange}
            className={clsx(baseInputClasses, fullWidth && "w-full")}
          />
        </div>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          onChange={onChange}
          className={clsx(baseInputClasses, fullWidth && "w-full")}
        />
      )}
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
}
