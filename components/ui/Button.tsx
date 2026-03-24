import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

const variants: Record<Variant, string> = {
  primary: "bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60",
  secondary: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
  danger: "bg-danger-600 hover:bg-danger-700 text-white disabled:opacity-60",
  ghost: "text-primary-600 hover:text-primary-800",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
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
          "flex items-center justify-center gap-2 font-medium rounded-lg transition-colors",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? "Učitavanje..." : children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
