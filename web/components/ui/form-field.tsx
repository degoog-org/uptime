import type { JSX, ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export const FormField = ({
  label,
  error,
  children,
}: FormFieldProps): JSX.Element => (
  <label className="ext-field">
    <span className="ext-field-label">{label}</span>
    {children}
    {error && <span className="text-[0.8125rem] text-danger">{error}</span>}
  </label>
);
