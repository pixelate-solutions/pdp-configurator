import { Badge } from "@/components/ui/badge";

export type AdminColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

export function AdminDataTable<T extends { id: string; isActive?: boolean }>({
  columns,
  rows,
  emptyLabel = "No records yet.",
}: {
  columns: AdminColumn<T>[];
  rows: T[];
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-6 text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-white md:block">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-2">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border align-top">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-lg border border-border bg-white p-4">
            <div className="mb-3 flex justify-end">
              {typeof row.isActive === "boolean" ? (
                <Badge variant={row.isActive ? "success" : "muted"}>
                  {row.isActive ? "Active" : "Inactive"}
                </Badge>
              ) : null}
            </div>
            <dl className="grid gap-2 text-sm">
              {columns.map((column) => (
                <div key={column.key} className="border-t border-border pt-2">
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">
                    {column.header}
                  </dt>
                  <dd className="mt-1">{column.render(row)}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
