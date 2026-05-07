import { notFound } from "next/navigation";
import { getAdminCatalog } from "@/lib/db/queries";
import { AdminFrameForm } from "@/components/admin/AdminFrameForm";
import { AdminSlotEditor } from "@/components/admin/AdminSlotEditor";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { Badge } from "@/components/ui/badge";
import { deleteSlotAction } from "@/lib/actions";

export default async function AdminFrameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catalog = await getAdminCatalog();
  const frame = catalog.frames.find((item) => item.id === id);
  if (!frame) notFound();
  const slots = catalog.slots
    .filter((slot) => slot.frameId === frame.id)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="grid gap-5">
      <section>
        <h2 className="mb-3 text-xl font-semibold">Edit frame</h2>
        <AdminFrameForm frame={frame} />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Add slot</h2>
        <AdminSlotEditor frame={frame} />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Slot layout</h2>
        <AdminDataTable
          rows={slots}
          columns={[
            { key: "order", header: "Order", render: (row) => row.displayOrder },
            { key: "label", header: "Label", render: (row) => row.label },
            { key: "circuits", header: "Circuits", render: (row) => row.circuitNumbers },
            { key: "type", header: "Type", render: (row) => row.slotType },
            { key: "family", header: "Family", render: (row) => <Badge>{row.breakerFamily}</Badge> },
            {
              key: "coords",
              header: "Visual",
              render: (row) => `${row.x}, ${row.y}, ${row.width}, ${row.height}`,
            },
            {
              key: "delete",
              header: "Delete",
              render: (row) => <DeleteRecordButton id={row.id} action={deleteSlotAction} />,
            },
          ]}
        />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Edit slots</h2>
        <div className="grid gap-3">
          {slots.map((slot) => (
            <details key={slot.id} className="rounded-lg border border-border bg-white p-4">
              <summary className="cursor-pointer font-semibold">
                {slot.label} • circuits {slot.circuitNumbers}
              </summary>
              <div className="mt-4">
                <AdminSlotEditor frame={frame} slot={slot} />
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
