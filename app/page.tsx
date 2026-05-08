import { ConfiguratorWorkspace } from "@/components/configurator/ConfiguratorWorkspace";
import { getConfiguratorData } from "@/lib/db/queries";

export default async function HomePage() {
  const data = await getConfiguratorData();

  return (
    <ConfiguratorWorkspace
      key={`${data.selectedFrame.id}-frame`}
      data={data}
      initialStep="frame"
    />
  );
}
