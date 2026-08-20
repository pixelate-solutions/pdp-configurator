import type { Metadata } from "next";
import { PdpConfigurator } from "@/components/em/PdpConfigurator";

export const metadata: Metadata = {
  title: "PDP Configurator | Electro-Matic",
};

export default function PdpPage() {
  return <PdpConfigurator />;
}
