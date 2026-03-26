import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-linear-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 text-white shadow-lg disabled:opacity-50",
  secondary:
    "bg-transparent border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50",
  ghost:
    "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 disabled:opacity-50",
  danger:
    "bg-linear-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white shadow-lg disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded font-semibold uppercase tracking-wider cursor-pointer border-0 focus:outline-none active:scale-95 transition-all duration-200 ease-in-out disabled:cursor-not-allowed overflow-hidden group",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-200 pointer-events-none" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? "Učitavanje..." : children}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
