import type { Metadata } from "next";
import { PduConfigurator } from "@/components/em/PduConfigurator";

export const metadata: Metadata = {
  title: "PDU Configurator | Electro-Matic",
};

export default function PduPage() {
  return <PduConfigurator />;
}
