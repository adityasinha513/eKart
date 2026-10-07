import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
}

export default function SecondaryButton({
  children,
  fullWidth = false,
  className = "",
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-mithai-300 bg-white px-5 py-3 font-semibold text-maroon-700 transition-colors hover:bg-mithai-50 ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
