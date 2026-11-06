import type { ButtonHTMLAttributes, JSX } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "btn btn--primary degoog-btn degoog-btn--primary",
  secondary: "btn btn--secondary degoog-btn degoog-btn--secondary",
  danger: "btn btn--danger degoog-btn degoog-btn--danger",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  small?: boolean;
}

export const Button = ({
  variant = "secondary",
  small = false,
  className,
  type = "button",
  ...props
}: ButtonProps): JSX.Element => (
  <button
    type={type}
    className={[
      VARIANT_CLASSES[variant],
      small ? "degoog-btn--sm" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
);
