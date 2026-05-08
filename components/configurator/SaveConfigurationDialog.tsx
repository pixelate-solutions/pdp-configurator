"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ConfiguratorData, SlotSelection } from "@/lib/configurator-types";
import { saveConfigurationAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SaveConfigurationDialog({
  open,
  onOpenChange,
  data,
  selections,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ConfiguratorData;
  selections: SlotSelection;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: `${data.selectedFrame.heightInches} in ${data.selectedFrame.panelType} quote`,
    customerName: "",
    projectName: "",
    notes: "",
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = () => {
    startTransition(async () => {
      const result = await saveConfigurationAction({
        frameId: data.selectedFrame.id,
        ...form,
        selections,
      });
      setMessage(result.message);
      if (result.ok && result.id) {
        onOpenChange(false);
        router.push(`/configurator/${result.id}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save configuration</DialogTitle>
          <DialogDescription>
            Save the current slot selections and customer quote as a
            configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label htmlFor="name">Configuration name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="customerName">Customer</Label>
            <Input
              id="customerName"
              value={form.customerName}
              onChange={(event) => update("customerName", event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="projectName">Project</Label>
            <Input
              id="projectName"
              value={form.projectName}
              onChange={(event) => update("projectName", event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
          </div>
          {message ? (
            <p className="rounded-2xl border border-white/70 bg-white/58 p-3 text-sm text-muted-foreground backdrop-blur">
              {message}
            </p>
          ) : null}
          <Button type="button" onClick={save} disabled={pending}>
            {pending ? "Saving..." : "Save configuration"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
