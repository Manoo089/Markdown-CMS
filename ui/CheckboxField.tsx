import clsx from "clsx";
import { BaseFieldProps } from "@/types/form";

interface Props extends Pick<BaseFieldProps, "id" | "label" | "className" | "disabled"> {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckboxField({ checked, className, disabled, id, label, onChange }: Props) {
  return (
    <div className={clsx("flex items-center", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={clsx(
          "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      <label
        htmlFor={id}
        className={clsx("ml-2 block text-sm text-gray-700", disabled && "opacity-50 cursor-not-allowed")}
      >
        {label}
      </label>
    </div>
  );
}
