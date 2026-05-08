"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex min-h-11 items-center rounded-full border border-white/70 bg-white/58 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_28px_rgba(24,48,74,0.08)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "pressable inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full px-4 text-xs font-semibold text-muted-foreground transition hover:cursor-pointer hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-[0_8px_20px_rgba(24,48,74,0.12)]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    />
  );
}
