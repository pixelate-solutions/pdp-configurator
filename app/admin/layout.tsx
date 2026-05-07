import Link from "next/link";
import { assertAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const nav = [
  ["/admin", "Dashboard"],
  ["/admin/frames", "Frames"],
  ["/admin/breakers", "Breakers"],
  ["/admin/accessories", "Accessories"],
  ["/admin/cover-plates", "Cover plates"],
  ["/admin/configurations", "Configurations"],
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertAdmin();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5">
          <p className="text-sm font-semibold text-primary">Admin</p>
          <h1 className="text-3xl font-semibold">Configurator data</h1>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {nav.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="min-h-10 shrink-0 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold shadow-sm"
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
