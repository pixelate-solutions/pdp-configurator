import { ConfiguratorWorkspace } from "@/components/configurator/ConfiguratorWorkspace";
import { getPricingAccess } from "@/lib/auth";
import {
  getConfiguratorData,
  getSavedConfigurationImportOptions,
} from "@/lib/db/queries";

export default async function ConfiguratorPage({
  searchParams,
}: {
  searchParams: Promise<{ frameId?: string; step?: string }>;
}) {
  const params = await searchParams;
  const [data, pricingAccess, savedConfigurations] = await Promise.all([
    getConfiguratorData(params.frameId),
    getPricingAccess(),
    getSavedConfigurationImportOptions(),
  ]);

  return (
    <ConfiguratorWorkspace
      key={`${data.selectedFrame.id}-${params.step ?? "frame"}`}
      data={data}
      pricingAccess={pricingAccess}
      savedConfigurations={savedConfigurations}
      initialStep={
        params.step === "breakers" || params.step === "quote" ? params.step : "frame"
      }
    />
  );
}
