import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export default function PrimaryButton({
  children,
  fullWidth = false,
  icon,
  className = "",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-maroon-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-maroon-800 disabled:cursor-not-allowed disabled:bg-mithai-200 disabled:text-mithai-700 ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
