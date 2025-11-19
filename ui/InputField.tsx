import clsx from "clsx";

type InputFieldTypes = "text" | "email" | "password";

interface BaseProps {
  advancedLabel?: string;
  id: string;
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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TextareaProps extends BaseProps {
  type: "textarea";
  isMarkdown?: boolean;
  rows?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

type Props = InputProps | TextareaProps;

export default function InputField({
  advancedLabel,
  id,
  fullWidth,
  isMarkdown,
  label,
  placeholder,
  required,
  type,
  rows,
  value,
  onChange,
}: Props) {
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
          className={clsx(
            "px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            fullWidth && "w-full",
            isMarkdown && "font-mono"
          )}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          onChange={onChange}
          className={clsx(
            "px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            fullWidth && "w-full"
          )}
        />
      )}
    </div>
  );
}
