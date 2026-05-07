import { notFound } from "next/navigation";
import { ConfiguratorWorkspace } from "@/components/configurator/ConfiguratorWorkspace";
import { getSavedConfiguration } from "@/lib/db/queries";

export default async function SavedConfigurationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const saved = await getSavedConfiguration(id);
  if (!saved) notFound();

  return (
    <ConfiguratorWorkspace
      data={saved.data}
      initialSelections={saved.selections}
    />
  );
}
