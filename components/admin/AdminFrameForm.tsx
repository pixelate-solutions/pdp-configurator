import type { Frame } from "@/lib/configurator-types";
import { upsertFrameAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminFrameForm({ frame }: { frame?: Frame }) {
  const fields: Array<[keyof Frame, string, string]> = [
    ["name", "Name", "text"],
    ["catalogNumber", "Catalog number", "text"],
    ["panelType", "Panel type", "text"],
    ["heightInches", "Height inches", "number"],
    ["enclosure", "Enclosure", "text"],
    ["systemVoltage", "System voltage", "text"],
    ["irRating", "IR rating", "text"],
    ["mainBusAmps", "Main bus amps", "number"],
    ["busMaterial", "Bus material", "text"],
    ["feed", "Feed", "text"],
    ["mounting", "Mounting", "text"],
    ["conduitArea", "Conduit area", "text"],
    ["baseCost", "Base cost", "number"],
    ["baseSellPrice", "Base sell price", "number"],
  ];

  return (
    <form action={upsertFrameAction} className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <input type="hidden" name="id" value={frame?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([name, label, type]) => (
          <div key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              name={name}
              type={type}
              step={type === "number" ? "0.01" : undefined}
              defaultValue={String(frame?.[name] ?? "")}
              required
            />
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold">
          <input name="seLabel" type="checkbox" defaultChecked={frame?.seLabel ?? false} />
          SE label
        </label>
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold">
          <input name="seriesRated" type="checkbox" defaultChecked={frame?.seriesRated ?? false} />
          Series rated
        </label>
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold">
          <input name="isActive" type="checkbox" defaultChecked={frame?.isActive ?? true} />
          Active
        </label>
      </div>
      <Button className="mt-4 w-full sm:w-auto" type="submit">
        Save frame
      </Button>
    </form>
  );
}
