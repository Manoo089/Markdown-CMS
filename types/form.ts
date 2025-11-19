export interface BaseFieldProps {
  id: string;
  label: string;
  advancedLabel?: string;
  className?: string;
  description?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  required?: boolean;
}

export interface BaseInputProps extends BaseFieldProps {
  placeholder?: string;
  value: string;
}
