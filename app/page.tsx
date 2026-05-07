import Link from "next/link";
import { ArrowRight, FileSpreadsheet, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-10">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-border bg-white px-3 py-1 text-sm font-medium text-primary">
            Electro-Matic Siemens Panelboard Configurator
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            Build a sellable PDP BOM from a tap-friendly panelboard layout.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Select a Siemens frame, tap breaker slots, choose valid amperages,
            and get a live quote-ready bill of materials with breakers, cover
            plates, accessories, and pricing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/configurator">
                Start configuring <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/admin">Admin data</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Visual slot picking",
              text: "Large mobile tap targets make it practical for salespeople in the field.",
            },
            {
              icon: ShieldCheck,
              title: "Validated choices",
              text: "3VA41 and 3VA52 breaker rules are enforced by slot type.",
            },
            {
              icon: FileSpreadsheet,
              title: "Live BOM exports",
              text: "Generate printable quotes and CSV BOMs without spreadsheet cleanup.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-lg border border-border bg-white p-5 shadow-sm"
              >
                <Icon className="size-6 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
