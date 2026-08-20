import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "pressable inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 tap-highlight",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-dark",
        secondary:
          "border border-border bg-card text-foreground shadow-sm hover:border-primary/40",
        ghost: "text-foreground hover:bg-muted",
        danger: "bg-danger text-white shadow-sm hover:bg-danger/90",
        outline: "border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-card",
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
