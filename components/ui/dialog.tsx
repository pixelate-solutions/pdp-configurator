"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          "glass-panel fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 shadow-2xl focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <Button
            aria-label="Close"
            className="absolute right-3 top-3"
            size="icon"
            variant="ghost"
          >
            <X className="size-5" />
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mb-4 pr-8" {...props} />;
}

export function DialogTitle(
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>,
) {
  return (
    <DialogPrimitive.Title className="text-xl font-semibold" {...props} />
  );
}

export function DialogDescription(
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>,
) {
  return (
    <DialogPrimitive.Description
      className="mt-2 text-sm leading-6 text-muted-foreground"
      {...props}
    />
  );
}
