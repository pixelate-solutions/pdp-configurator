import { notFound } from "next/navigation";
import { ConfiguratorWorkspace } from "@/components/configurator/ConfiguratorWorkspace";
import { getPricingAccess } from "@/lib/auth";
import {
  getSavedConfiguration,
  getSavedConfigurationImportOptions,
} from "@/lib/db/queries";

export default async function SavedConfigurationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [saved, pricingAccess, savedConfigurations] = await Promise.all([
    getSavedConfiguration(id),
    getPricingAccess(),
    getSavedConfigurationImportOptions(),
  ]);
  if (!saved) notFound();

  return (
    <ConfiguratorWorkspace
      data={saved.data}
      pricingAccess={pricingAccess}
      savedConfigurations={savedConfigurations}
      initialSelections={saved.selections}
      initialFrameSelected
    />
  );
}
