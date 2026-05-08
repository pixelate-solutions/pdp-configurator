import Link from "next/link";
import { getAdminCatalog } from "@/lib/db/queries";
import { currency } from "@/lib/utils";
import { marginFromCostSell } from "@/lib/pricing";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminFrameForm } from "@/components/admin/AdminFrameForm";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteFrameAction } from "@/lib/actions";

export default async function AdminFramesPage() {
  const { frames } = await getAdminCatalog();

  return (
    <div className="grid gap-5">
      <section>
        <h2 className="mb-3 text-xl font-semibold">Create frame</h2>
        <AdminFrameForm />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Frames</h2>
        <AdminDataTable
          rows={frames}
          columns={[
            { key: "name", header: "Name", render: (row) => row.name },
            { key: "catalog", header: "Catalog", render: (row) => row.catalogNumber },
            { key: "type", header: "Type", render: (row) => row.panelType },
            { key: "bus", header: "Bus", render: (row) => `${row.mainBusAmps}A` },
            { key: "cost", header: "Cost", render: (row) => currency(row.baseCost) },
            { key: "sell", header: "Sell", render: (row) => currency(row.baseSellPrice) },
            {
              key: "margin",
              header: "Margin",
              render: (row) => `${(marginFromCostSell(row.baseCost, row.baseSellPrice) * 100).toFixed(1)}%`,
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
              key: "edit",
              header: "Actions",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/admin/frames/${row.id}`}>Open</Link>
                  </Button>
                  <DeleteRecordButton id={row.id} action={deleteFrameAction} />
                </div>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
