import { getAdminCatalog } from "@/lib/db/queries";
import { currency } from "@/lib/utils";
import { marginFromCostSell } from "@/lib/pricing";
import { AdminCoverPlateForm } from "@/components/admin/AdminCoverPlateForm";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { Badge } from "@/components/ui/badge";
import { deleteCoverPlateAction } from "@/lib/actions";

export default async function AdminCoverPlatesPage() {
  const { coverPlates } = await getAdminCatalog();

  return (
    <div className="grid gap-5">
      <section>
        <h2 className="mb-3 text-xl font-semibold">Create cover plate</h2>
        <AdminCoverPlateForm />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Cover plates</h2>
        <AdminDataTable
          rows={coverPlates}
          columns={[
            { key: "slotType", header: "Slot type", render: (row) => <Badge>{row.slotType}</Badge> },
            { key: "catalog", header: "Catalog", render: (row) => row.catalogNumber },
            { key: "description", header: "Description", render: (row) => row.description },
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
              render: (row) => <DeleteRecordButton id={row.id} action={deleteCoverPlateAction} />,
            },
          ]}
        />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Edit cover plates</h2>
        <div className="grid gap-3">
          {coverPlates.map((coverPlate) => (
            <details key={coverPlate.id} className="liquid-surface rounded-3xl p-4">
              <summary className="cursor-pointer font-semibold">
                {coverPlate.slotType} • {coverPlate.catalogNumber}
              </summary>
              <div className="mt-4">
                <AdminCoverPlateForm coverPlate={coverPlate} />
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
