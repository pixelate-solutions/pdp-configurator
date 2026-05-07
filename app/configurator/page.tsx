import { ConfiguratorWorkspace } from "@/components/configurator/ConfiguratorWorkspace";
import { getConfiguratorData } from "@/lib/db/queries";

export default async function ConfiguratorPage({
  searchParams,
}: {
  searchParams: Promise<{ frameId?: string }>;
}) {
  const params = await searchParams;
  const data = await getConfiguratorData(params.frameId);

  return <ConfiguratorWorkspace data={data} />;
}
