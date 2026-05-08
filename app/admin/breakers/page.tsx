import { getAdminCatalog } from "@/lib/db/queries";
import { currency } from "@/lib/utils";
import { marginFromCostSell } from "@/lib/pricing";
import { AdminBreakerForm } from "@/components/admin/AdminBreakerForm";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { Badge } from "@/components/ui/badge";
import { deleteBreakerAction } from "@/lib/actions";

export default async function AdminBreakersPage() {
  const { breakerOptions } = await getAdminCatalog();

  return (
    <div className="grid gap-5">
      <section>
        <h2 className="mb-3 text-xl font-semibold">Create breaker option</h2>
        <AdminBreakerForm />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Breaker options</h2>
        <AdminDataTable
          rows={breakerOptions}
          columns={[
            { key: "family", header: "Family", render: (row) => <Badge>{row.family}</Badge> },
            { key: "amps", header: "Amps", render: (row) => `${row.amps}A/${row.poles}P` },
            { key: "catalog", header: "Catalog", render: (row) => row.catalogNumber },
            { key: "type", header: "Type", render: (row) => row.type },
            { key: "cost", header: "Cost", render: (row) => currency(row.cost) },
            { key: "sell", header: "Sell", render: (row) => currency(row.sellPrice) },
            {
              key: "margin",
              header: "Margin",
              render: (row) => `${(marginFromCostSell(row.cost, row.sellPrice) * 100).toFixed(1)}%`,
            },
            {
              key: "active",
              header: "Status",
              render: (row) => (
                <Badge variant={row.isActive ? "success" : "muted"}>
                  {row.isActive ? "Active" : "Inactive"}
                </Badge>
              ),
            },
            {
              key: "delete",
              header: "Delete",
              render: (row) => <DeleteRecordButton id={row.id} action={deleteBreakerAction} />,
            },
          ]}
        />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Edit breaker options</h2>
        <div className="grid gap-3">
          {breakerOptions.map((breaker) => (
            <details key={breaker.id} className="liquid-surface rounded-3xl p-4">
              <summary className="cursor-pointer font-semibold">
                {breaker.family} {breaker.amps}A • {breaker.catalogNumber}
              </summary>
              <div className="mt-4">
                <AdminBreakerForm breaker={breaker} />
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
