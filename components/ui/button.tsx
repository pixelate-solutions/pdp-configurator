import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "pressable inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold shadow-sm transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 tap-highlight",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(26,83,141,0.24)] hover:bg-[var(--blue-light)] hover:shadow-[0_16px_34px_rgba(26,83,141,0.3)]",
        secondary:
          "border border-white/70 bg-white/78 text-foreground shadow-[0_8px_24px_rgba(24,48,74,0.08)] backdrop-blur hover:border-primary/25 hover:bg-white",
        ghost: "text-foreground hover:bg-white/72 hover:shadow-sm",
        danger: "bg-danger text-white shadow-[0_12px_28px_rgba(194,65,12,0.22)] hover:bg-danger/90",
        outline:
          "border border-border bg-white/30 text-foreground backdrop-blur hover:border-primary/30 hover:bg-white/80",
      },
      size: {
        default: "px-4 py-2.5",
        sm: "min-h-9 px-3 py-2 text-xs",
        lg: "min-h-12 px-5 py-3 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
