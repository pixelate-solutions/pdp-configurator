import type { Frame, PanelSlot } from "@/lib/configurator-types";
import { upsertSlotAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminSlotEditor({
  frame,
  slot,
}: {
  frame: Frame;
  slot?: PanelSlot;
}) {
  const fields: Array<[keyof PanelSlot, string, string]> = [
    ["slotKey", "Slot key", "text"],
    ["displayOrder", "Display order", "number"],
    ["label", "Label", "text"],
    ["circuitNumbers", "Circuit numbers", "text"],
    ["uniqueId", "Unique ID", "number"],
    ["slotType", "Slot type", "text"],
    ["breakerFamily", "Breaker family", "text"],
    ["defaultAmps", "Default amps", "number"],
    ["poles", "Poles", "number"],
    ["interruptRating", "Interrupt rating", "text"],
    ["lugSize", "Lug size", "text"],
    ["x", "X %", "number"],
    ["y", "Y %", "number"],
    ["width", "Width %", "number"],
    ["height", "Height %", "number"],
  ];

  return (
    <form action={upsertSlotAction} className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <input type="hidden" name="id" value={slot?.id ?? ""} />
      <input type="hidden" name="frameId" value={frame.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([name, label, type]) => (
          <div key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              name={name}
              type={type}
              step={type === "number" ? "0.01" : undefined}
              defaultValue={String(slot?.[name] ?? "")}
              required={name !== "defaultAmps"}
            />
          </div>
        ))}
      </div>
      <label className="mt-4 flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold">
        <input name="isActive" type="checkbox" defaultChecked={slot?.isActive ?? true} />
        Active
      </label>
      <Button className="mt-4 w-full sm:w-auto" type="submit">
        Save slot
      </Button>
    </form>
  );
}
