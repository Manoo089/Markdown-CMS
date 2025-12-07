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
 * <Button href="/" label="Zum Dashboard" />
 *
 * @example
 * // Danger outline
 * <Button type="button" label="Löschen" color="danger" variant="outline" />
 */

export default function Button(props: Props) {
  const {
    className,
    color = "primary",
    disabled = false,
    fullWidth,
    label,
    variant = "solid",
  } = props;

  const styles: ButtonStyles = {
    solid: {
      primary: {
        base: "bg-primary text-white",
        hover: "hover:bg-primary-hover",
      },
      secondary: {
        base: "bg-secondary text-white",
        hover: "hover:bg-secondary-hover",
      },
      success: {
        base: "bg-success text-white",
        hover: "hover:brightness-110",
      },
      danger: {
        base: "bg-danger text-white",
        hover: "hover:bg-danger-hover",
      },
    },
    outline: {
      primary: {
        base: "bg-transparent text-primary border border-primary",
        hover: "hover:bg-primary-light hover:border-primary-hover",
      },
      secondary: {
        base: "bg-transparent text-secondary border border-secondary",
        hover: "hover:bg-surface-hover hover:border-secondary-hover",
      },
      success: {
        base: "bg-transparent text-success border border-success",
        hover: "hover:bg-success-light",
      },
      danger: {
        base: "bg-transparent text-danger border border-danger",
        hover: "hover:bg-danger-light hover:border-danger-hover",
      },
    },
    plain: {
      primary: {
        base: "bg-transparent text-primary",
        hover: "hover:text-primary-hover hover:underline",
      },
      secondary: {
        base: "bg-transparent text-secondary",
        hover: "hover:text-text",
      },
      success: {
        base: "bg-transparent text-success",
        hover: "hover:brightness-110",
      },
      danger: {
        base: "bg-transparent text-danger",
        hover: "hover:text-danger-hover",
      },
    },
  };

  const classes = twMerge(
    clsx(
      "px-4 py-2 rounded font-medium transition-all inline-block text-center cursor-pointer",
      styles[variant][color].base,
      !disabled && styles[variant][color].hover,
      fullWidth && "w-full",
      disabled && "opacity-50 cursor-not-allowed",
      className,
    ),
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
    <button
      type={props.type}
      disabled={disabled}
      onClick={props.onClick}
      className={classes}
    >
      {label}
    </button>
  );
}
