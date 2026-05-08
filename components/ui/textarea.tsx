import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-24 w-full rounded-2xl border border-border bg-white/82 px-3.5 py-2 text-sm shadow-inner outline-none backdrop-blur transition placeholder:text-muted-foreground focus:border-primary/55 focus:bg-white focus:ring-4 focus:ring-primary/15",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
