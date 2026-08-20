import type { Metadata } from "next";
import { ConfiguratorWorkspace } from "@/components/configurator/ConfiguratorWorkspace";
import { getConfiguratorData } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Siemens Panelboard Configurator | Electro-Matic",
};

export default async function PanelboardsPage({
  searchParams,
}: {
  searchParams: Promise<{ frameId?: string; step?: string }>;
}) {
  const params = await searchParams;
  const data = await getConfiguratorData(params.frameId);
  const step =
    params.step === "breakers" || params.step === "summary" ? params.step : "frame";

  return (
    <ConfiguratorWorkspace
      key={`${data.selectedFrame.id}-${step}`}
      data={data}
      initialFrameSelected={Boolean(params.frameId)}
      initialStep={step}
    />
  );
}
