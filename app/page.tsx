import { ConfiguratorWorkspace } from "@/components/configurator/ConfiguratorWorkspace";
import { getPricingAccess } from "@/lib/auth";
import {
  getConfiguratorData,
  getSavedConfigurationImportOptions,
} from "@/lib/db/queries";

export default async function HomePage() {
  const [data, pricingAccess, savedConfigurations] = await Promise.all([
    getConfiguratorData(),
    getPricingAccess(),
    getSavedConfigurationImportOptions(),
  ]);

  return (
    <ConfiguratorWorkspace
      key={`${data.selectedFrame.id}-frame`}
      data={data}
      pricingAccess={pricingAccess}
      savedConfigurations={savedConfigurations}
      initialStep="frame"
    />
  );
}
