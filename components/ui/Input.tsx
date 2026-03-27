import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "filled";
type InputSize = "sm" | "md" | "lg";

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  error?: string;
  required?: boolean;
  variant?: Variant;
  size?: InputSize;
  icon?: ReactNode;
};

const variants: Record<Variant, string> = {
  default:
    "bg-transparent border-zinc-600 focus:border-red-600 focus:ring-red-500",
  filled:
    "bg-zinc-800/60 border-zinc-700 focus:border-red-600 focus:ring-red-500",
};

const sizes: Record<InputSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-4 py-3 text-base",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      required,
      variant = "default",
      size = "md" as InputSize,
      id,
      className,
      icon,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded border text-zinc-100 placeholder-zinc-500 shadow-sm focus:ring-2 focus:outline-none transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed",
              variants[variant],
              sizes[size],
              error &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/50",
              className,
            )}
            {...props}
          />
          {icon && icon}
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
