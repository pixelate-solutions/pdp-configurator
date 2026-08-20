import type { Metadata } from "next";
import { Snowflake } from "lucide-react";

export const metadata: Metadata = {
  title: "CDU Configurator | Electro-Matic",
};

export default function CduPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      <h1 className="text-3xl font-bold">Cooling Distribution Units</h1>
      <div className="card mt-6 flex flex-col items-center gap-4 p-16 text-center">
        <Snowflake className="size-12 text-primary" />
        <h2 className="text-xl font-bold">Configurator Coming Soon</h2>
        <a
          href="https://www.electro-matic.com/contact-us/"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          Contact Electro-Matic
        </a>
      </div>
    </div>
  );
}
