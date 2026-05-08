import Link from "next/link";
import { Settings } from "lucide-react";

export function AppNavbar() {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-white/18 bg-primary/88 text-white shadow-[0_10px_32px_rgba(20,64,118,0.22)] backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="pressable min-w-0 truncate rounded-full px-2 py-1 text-[15px] font-semibold tracking-normal"
        >
          Electro-Matic Products
          <span className="ml-2 text-[13px] font-normal opacity-60">
            PDP Configurator
          </span>
        </Link>

        <Link
          href="/admin"
          className="pressable inline-flex min-h-8 shrink-0 items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 text-xs text-white/80 shadow-sm backdrop-blur transition hover:bg-white/18 hover:text-white"
        >
          <Settings className="size-3.5" />
          Admin
        </Link>
      </div>
    </header>
  );
}
