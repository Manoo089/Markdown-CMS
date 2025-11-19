import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import Link from "next/link";

type ButtonTypes = "submit" | "reset" | "button";
type ButtonColors = "primary" | "secondary" | "success" | "danger";
type ButtonVariants = "solid" | "outline" | "plain";

interface BaseProps {
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  label: string;
  variant?: ButtonVariants;
  color?: ButtonColors;
}

interface ButtonProps extends BaseProps {
  type: ButtonTypes;
  href?: never;
  onClick?: () => void | Promise<void>;
}

interface LinkProps extends BaseProps {
  href: string;
  type?: never;
  onClick?: never;
}

interface ButtonStyle {
  base: string;
  hover: string;
}

type ButtonStyles = {
  [V in ButtonVariants]: {
    [C in ButtonColors]: ButtonStyle;
  };
};

type Props = ButtonProps | LinkProps;

/**
 * Polymorphe Button-Komponente, die als Button oder Link gerendert werden kann.
 *
 * @param props - Die Komponenten-Props
 * @param props.label - Der angezeigte Text im Button
 * @param props.className - Zusätzliche CSS-Klassen für individuelle Anpassungen
 * @param props.color - Farbschema des Buttons (primary/secondary/danger)
 * @param props.disabled - Deaktiviert den Button/Link
 * @param props.fullWidth - Button nimmt die volle Breite ein
 * @param props.variant - Visuelle Variante des Buttons (solid/outline/plain)
 * @param props.type - Button-Typ (submit/reset/button) - nur für Button-Variante
 * @param props.href - Ziel-URL - nur für Link-Variante
 * @param props.onClick - Click-Handler (sync oder async) - nur für Button-Variante
 *
 * @example
 * // Als Submit-Button
 * <Button type="submit" label="Speichern" />
 *
 * @example
 * // Als Link
 * <Button href="/dashboard" label="Zum Dashboard" />
 *
 * @example
 * // Danger outline
 * <Button type="button" label="Löschen" color="danger" variant="outline" />
 */

export default function Button(props: Props) {
  const { className, color = "primary", disabled = false, fullWidth, label, variant = "solid" } = props;

  const styles: ButtonStyles = {
    solid: {
      primary: {
        base: "bg-blue-600 text-white",
        hover: "hover:bg-blue-700",
      },
      secondary: {
        base: "bg-gray-600 text-white",
        hover: "hover:bg-gray-900",
      },
      success: {
        base: "bg-green-600 text-white",
        hover: "hover:bg-green-700",
      },
      danger: {
        base: "bg-red-600 text-white",
        hover: "hover:bg-red-700",
      },
    },
    outline: {
      primary: {
        base: "bg-transparent text-blue-600 border border-blue-600",
        hover: "hover:text-blue-700 hover:border-blue-700",
      },
      secondary: {
        base: "bg-transparent text-gray-600 border border-gray-600",
        hover: "hover:text-gray-900 hover:border-gray-900",
      },
      success: {
        base: "bg-transparent text-green-600 border border-green-600",
        hover: "hover:text-green-700 hover:border-green-700",
      },
      danger: {
        base: "bg-transparent text-red-600 border border-red-600",
        hover: "hover:text-red-700 hover:border-red-700",
      },
    },
    plain: {
      primary: {
        base: "bg-transparent text-blue-600",
        hover: "hover:text-blue-700",
      },
      secondary: {
        base: "bg-transparent text-gray-600",
        hover: "hover:text-gray-900",
      },
      success: {
        base: "bg-transparent text-green-600",
        hover: "hover:text-green-700",
      },
      danger: {
        base: "bg-transparent text-red-600",
        hover: "hover:text-red-700",
      },
    },
  };

  const classes = twMerge(
    clsx(
      "px-4 py-2 rounded font-medium transition-colors inline-block text-center cursor-pointer",
      styles[variant][color].base,
      !disabled && styles[variant][color].hover,
      fullWidth && "w-full",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )
  );

  // Link-Variante
  if ("href" in props && props.href) {
    if (disabled) {
      return (
        <span className={classes} aria-disabled="true">
          {label}
        </span>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {label}
      </Link>
    );
  }

  // Button-Variante
  return (
    <button type={props.type} disabled={disabled} onClick={props.onClick} className={classes}>
      {label}
    </button>
  );
}
