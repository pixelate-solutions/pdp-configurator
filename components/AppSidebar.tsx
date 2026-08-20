"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, LayoutPanelTop, PanelsTopLeft, PlugZap, Server, Snowflake, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/panelboards", label: "Siemens Panelboards", icon: LayoutPanelTop },
  { href: "/pdp", label: "Power Distribution Panels", icon: PanelsTopLeft },
  { href: "/pdu", label: "Power Distribution Units", icon: PlugZap },
  { href: "/rpp", label: "Remote Power Panels", icon: Server },
  { href: "/cdu", label: "Cooling Distribution Units", icon: Snowflake },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-primary text-white"
                : "text-foreground/75 hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <Link href="/" className="flex items-center px-5 pt-5 pb-4">
          <Image
            src="/brand/logo-linear.svg"
            alt="Electro-Matic"
            width={168}
            height={43}
            priority
          />
        </Link>
        <div className="px-5 pb-4">
          <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
            Configurators
          </p>
        </div>
        <NavLinks />
        <div className="mt-auto px-5 py-4">
          <a
            href="https://www.electro-matic.com/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-primary hover:underline"
          >
            electro-matic.com
          </a>
        </div>
      </aside>

      <header className="no-print sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/" onClick={() => setOpen(false)}>
          <Image src="/brand/logo-linear.svg" alt="Electro-Matic" width={132} height={34} priority />
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-border p-2 text-foreground"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        {open ? (
          <div className="absolute inset-x-0 top-14 border-b border-border bg-card py-3 shadow-lg">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        ) : null}
      </header>
    </>
  );
}
