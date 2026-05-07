import Link from "next/link";
import { format } from "date-fns";
import { getAdminCatalog } from "@/lib/db/queries";
import { currency, percent } from "@/lib/utils";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";

export default async function AdminConfigurationsPage() {
  const { configurations } = await getAdminCatalog();

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Saved configurations</h2>
      <AdminDataTable
        rows={configurations.map((item) => ({ ...item, isActive: true }))}
        emptyLabel="No saved configurations yet."
        columns={[
          { key: "name", header: "Name", render: (row) => row.name },
          { key: "customer", header: "Customer", render: (row) => row.customerName },
          { key: "project", header: "Project", render: (row) => row.projectName },
          { key: "total", header: "Total", render: (row) => currency(row.totalSellPrice) },
          { key: "margin", header: "Margin", render: (row) => percent(row.margin) },
          {
            key: "created",
            header: "Created",
            render: (row) => format(new Date(row.createdAt), "MMM d, yyyy"),
          },
          {
            key: "open",
            header: "Open",
            render: (row) => (
              <Button asChild size="sm" variant="secondary">
                <Link href={`/configurator/${row.id}`}>Edit</Link>
              </Button>
            ),
          },
        ]}
      />
    </section>
  );
}
