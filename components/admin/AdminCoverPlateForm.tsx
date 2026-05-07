import type { CoverPlate } from "@/lib/configurator-types";
import { upsertCoverPlateAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminCoverPlateForm({ coverPlate }: { coverPlate?: CoverPlate }) {
  return (
    <form action={upsertCoverPlateAction} className="rounded-lg border border-border bg-white p-4 shadow-sm">
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
      <label className="mt-4 flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold">
        <input name="isActive" type="checkbox" defaultChecked={coverPlate?.isActive ?? true} />
        Active
      </label>
      <Button className="mt-4 w-full sm:w-auto" type="submit">
        Save cover plate
      </Button>
    </form>
  );
}
