import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "muted" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variant === "default" &&
          "border-primary/20 bg-primary/10 text-primary",
        variant === "muted" && "border-border bg-muted text-muted-foreground",
        variant === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        variant === "warning" &&
          "border-amber-200 bg-amber-50 text-amber-800",
        variant === "danger" && "border-orange-200 bg-orange-50 text-danger",
        className,
      )}
      {...props}
    />
  );
}
