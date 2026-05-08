import Link from "next/link";
import { Settings } from "lucide-react";

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-30 bg-primary text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] no-print">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="min-w-0 truncate text-[15px] font-semibold tracking-normal"
        >
          Electro-Matic Products
          <span className="ml-2 text-[13px] font-normal opacity-60">
            PDP Configurator
          </span>
        </Link>

        <Link
          href="/admin"
          className="inline-flex min-h-8 shrink-0 items-center gap-2 rounded border border-white/30 px-3 text-xs text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <Settings className="size-3.5" />
          Admin
        </Link>
      </div>
    </header>
  );
}
