import type { Accessory } from "@/lib/configurator-types";
import { upsertAccessoryAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminAccessoryForm({ accessory }: { accessory?: Accessory }) {
  return (
    <form action={upsertAccessoryAction} className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <input type="hidden" name="id" value={accessory?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        {(["name", "catalogNumber", "description", "cost", "sellPrice"] as const).map((name) => (
          <div key={name}>
            <Label htmlFor={name}>{name.replace(/([A-Z])/g, " $1")}</Label>
            <Input
              id={name}
              name={name}
              type={name === "cost" || name === "sellPrice" ? "number" : "text"}
              step="0.01"
              defaultValue={String(accessory?.[name] ?? "")}
              required
            />
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold">
          <input name="isRequired" type="checkbox" defaultChecked={accessory?.isRequired ?? true} />
          Required
        </label>
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold">
          <input name="isActive" type="checkbox" defaultChecked={accessory?.isActive ?? true} />
          Active
        </label>
      </div>
      <Button className="mt-4 w-full sm:w-auto" type="submit">
        Save accessory
      </Button>
    </form>
  );
}
