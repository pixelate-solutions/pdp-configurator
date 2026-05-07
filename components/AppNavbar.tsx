import Link from "next/link";
import { Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/configurator", label: "Configurator" },
  { href: "/admin", label: "Admin" },
];

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur no-print">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold text-foreground"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-5" />
          </span>
          <span className="truncate">Electro-Matic PDP</span>
        </Link>

        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Button key={link.href} asChild size="sm" variant="ghost">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          <Button asChild size="icon" variant="secondary" aria-label="Admin">
            <Link href="/admin">
              <Settings className="size-4" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
