import Link from "next/link";
import { getAdminCatalog } from "@/lib/db/queries";
import { currency } from "@/lib/utils";
import { updateDefaultMarginAction } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const catalog = await getAdminCatalog();
  const cards = [
    ["Frames", catalog.frames.length, "/admin/frames"],
    ["Slots", catalog.slots.length, "/admin/frames"],
    ["Breaker options", catalog.breakerOptions.length, "/admin/breakers"],
    ["Accessories", catalog.accessories.length, "/admin/accessories"],
    ["Cover plates", catalog.coverPlates.length, "/admin/cover-plates"],
    ["Saved configurations", catalog.configurations.length, "/admin/configurations"],
  ] as const;

  const quotedTotal = catalog.configurations.reduce(
    (sum, item) => sum + Number(item.totalSellPrice ?? 0),
    0,
  );

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, count, href]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{count}</p>
              <Button asChild className="mt-4" variant="secondary">
                <Link href={href}>Manage</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Default pricing margin</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateDefaultMarginAction} className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1">
              <span className="text-sm font-semibold">Margin percent</span>
              <input
                className="min-h-11 w-28 rounded-md border border-border bg-white px-3 py-2 text-lg font-bold"
                name="defaultMargin"
                type="number"
                min="0"
                max="99"
                step="0.5"
                defaultValue={(catalog.defaultMargin * 100).toFixed(1)}
              />
            </label>
            <Button type="submit">Save margin</Button>
          </form>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer price is calculated from Electro-Matic cost using this margin.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Quote pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{currency(quotedTotal)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Total sell price across saved configurations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
