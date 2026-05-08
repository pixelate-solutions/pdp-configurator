import { getAdminCatalog } from "@/lib/db/queries";
import { currency } from "@/lib/utils";
import { marginFromCostSell } from "@/lib/pricing";
import { AdminAccessoryForm } from "@/components/admin/AdminAccessoryForm";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { Badge } from "@/components/ui/badge";
import { deleteAccessoryAction } from "@/lib/actions";

export default async function AdminAccessoriesPage() {
  const { accessories } = await getAdminCatalog();

  return (
    <div className="grid gap-5">
      <section>
        <h2 className="mb-3 text-xl font-semibold">Create accessory</h2>
        <AdminAccessoryForm />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Accessories</h2>
        <AdminDataTable
          rows={accessories}
          columns={[
            { key: "name", header: "Name", render: (row) => row.name },
            { key: "catalog", header: "Catalog", render: (row) => row.catalogNumber },
            { key: "required", header: "Rule", render: (row) => row.isRequired ? "Required" : "Optional" },
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
              render: (row) => <DeleteRecordButton id={row.id} action={deleteAccessoryAction} />,
            },
          ]}
        />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Edit accessories</h2>
        <div className="grid gap-3">
          {accessories.map((accessory) => (
            <details key={accessory.id} className="rounded-lg border border-border bg-white p-4">
              <summary className="cursor-pointer font-semibold">
                {accessory.name} • {accessory.catalogNumber}
              </summary>
              <div className="mt-4">
                <AdminAccessoryForm accessory={accessory} />
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
