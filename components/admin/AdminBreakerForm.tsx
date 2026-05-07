import type { BreakerOption } from "@/lib/configurator-types";
import { upsertBreakerAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminBreakerForm({ breaker }: { breaker?: BreakerOption }) {
  const fields: Array<[keyof BreakerOption, string, string]> = [
    ["family", "Family", "text"],
    ["type", "Type", "text"],
    ["amps", "Amps", "number"],
    ["poles", "Poles", "number"],
    ["interruptRating", "Interrupt rating", "text"],
    ["catalogNumber", "Catalog number", "text"],
    ["description", "Description", "text"],
    ["lugSize", "Lug size", "text"],
    ["cost", "Cost", "number"],
    ["sellPrice", "Sell price", "number"],
  ];

  return (
    <form action={upsertBreakerAction} className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <input type="hidden" name="id" value={breaker?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([name, label, type]) => (
          <div key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              name={name}
              type={type}
              step={type === "number" ? "0.01" : undefined}
              defaultValue={String(breaker?.[name] ?? "")}
              required
            />
          </div>
        ))}
      </div>
      <label className="mt-4 flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold">
        <input name="isActive" type="checkbox" defaultChecked={breaker?.isActive ?? true} />
        Active
      </label>
      <Button className="mt-4 w-full sm:w-auto" type="submit">
        Save breaker
      </Button>
    </form>
  );
}
