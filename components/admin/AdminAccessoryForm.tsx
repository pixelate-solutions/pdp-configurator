import type { Accessory } from "@/lib/configurator-types";
import { upsertAccessoryAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminAccessoryForm({ accessory }: { accessory?: Accessory }) {
  return (
    <form action={upsertAccessoryAction} className="liquid-surface rounded-3xl p-4">
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
        <label className="pressable flex min-h-11 items-center gap-2 rounded-2xl border border-white/70 bg-white/58 px-3 text-sm font-semibold backdrop-blur">
          <input name="isRequired" type="checkbox" defaultChecked={accessory?.isRequired ?? true} />
          Required
        </label>
        <label className="pressable flex min-h-11 items-center gap-2 rounded-2xl border border-white/70 bg-white/58 px-3 text-sm font-semibold backdrop-blur">
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
