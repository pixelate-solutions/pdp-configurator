import type { CoverPlate } from "@/lib/configurator-types";
import { upsertCoverPlateAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminCoverPlateForm({ coverPlate }: { coverPlate?: CoverPlate }) {
  return (
    <form action={upsertCoverPlateAction} className="liquid-surface rounded-3xl p-4">
      <input type="hidden" name="id" value={coverPlate?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        {(["slotType", "catalogNumber", "description", "cost", "sellPrice"] as const).map((name) => (
          <div key={name}>
            <Label htmlFor={name}>{name.replace(/([A-Z])/g, " $1")}</Label>
            <Input
              id={name}
              name={name}
              type={name === "cost" || name === "sellPrice" ? "number" : "text"}
              step="0.01"
              defaultValue={String(coverPlate?.[name] ?? "")}
              required
            />
          </div>
        ))}
      </div>
      <label className="pressable mt-4 flex min-h-11 items-center gap-2 rounded-2xl border border-white/70 bg-white/58 px-3 text-sm font-semibold backdrop-blur">
        <input name="isActive" type="checkbox" defaultChecked={coverPlate?.isActive ?? true} />
        Active
      </label>
      <Button className="mt-4 w-full sm:w-auto" type="submit">
        Save cover plate
      </Button>
    </form>
  );
}
