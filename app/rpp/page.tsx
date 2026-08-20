import type { Metadata } from "next";
import { RppConfigurator } from "@/components/em/RppConfigurator";

export const metadata: Metadata = {
  title: "RPP Configurator | Electro-Matic",
};

export default function RppPage() {
  return <RppConfigurator />;
}
