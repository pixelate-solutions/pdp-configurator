import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Electro-Matic Configurators",
};

const PRODUCTS = [
  {
    href: "/panelboards",
    name: "Siemens Panelboards",
    art: (
      <svg viewBox="0 0 80 100" className="h-24 w-auto">
        <rect x="14" y="4" width="52" height="92" rx="3" fill="#d7dade" stroke="#b8bcc2" strokeWidth="2" />
        <rect x="24" y="12" width="32" height="16" rx="2" fill="#005daa" />
        {[36, 50, 64, 78].map((y) => (
          <g key={y}>
            <rect x="22" y={y} width="16" height="10" rx="1" fill="#2c2d33" />
            <rect x="42" y={y} width="16" height="10" rx="1" fill="#2c2d33" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    href: "/pdp",
    name: "Power Distribution Panels",
    art: (
      <svg viewBox="0 0 80 100" className="h-24 w-auto">
        <rect x="10" y="6" width="60" height="84" rx="3" fill="#d7dade" stroke="#b8bcc2" strokeWidth="2" />
        <rect x="10" y="90" width="60" height="6" fill="#8f939a" />
        <rect x="60" y="36" width="6" height="24" rx="2" fill="#1c1d21" />
        {[20, 44, 68].map((y) => (
          <g key={y}>
            {[16, 28, 40].map((x) => (
              <rect key={x} x={x} y={y} width="9" height="16" rx="1" fill="#2c2d33" />
            ))}
          </g>
        ))}
      </svg>
    ),
  },
  {
    href: "/pdu",
    name: "Power Distribution Units",
    art: (
      <svg viewBox="0 0 100 100" className="h-24 w-auto">
        <rect x="4" y="16" width="26" height="76" rx="2" fill="#d7dade" stroke="#b8bcc2" strokeWidth="2" />
        <rect x="32" y="16" width="34" height="76" rx="2" fill="#d7dade" stroke="#b8bcc2" strokeWidth="2" />
        <rect x="68" y="16" width="28" height="76" rx="2" fill="#d7dade" stroke="#b8bcc2" strokeWidth="2" />
        <rect x="9" y="26" width="16" height="26" rx="2" fill="#2c2d33" />
        {[28, 38, 48, 58, 68].map((y) => (
          <rect key={y} x="38" y={y} width="22" height="5" rx="1" fill="#b8bcc2" />
        ))}
        {[26, 40, 54, 68].map((y) => (
          <rect key={y} x="73" y={y} width="18" height="9" rx="1" fill="#2c2d33" />
        ))}
      </svg>
    ),
  },
  {
    href: "/rpp",
    name: "Remote Power Panels",
    art: (
      <svg viewBox="0 0 80 100" className="h-24 w-auto">
        <rect x="16" y="4" width="48" height="92" rx="3" fill="#d7dade" stroke="#b8bcc2" strokeWidth="2" />
        <rect x="26" y="12" width="28" height="10" rx="2" fill="#2c2d33" />
        <rect x="24" y="28" width="32" height="48" rx="2" fill="#2c2d33" />
        {[32, 40, 48, 56, 64].map((y) => (
          <rect key={y} x="36" y={y} width="8" height="5" rx="1" fill="#f4f4f4" />
        ))}
        {[82].map((y) => (
          <rect key={y} x="24" y={y} width="32" height="8" rx="1" fill="#b8bcc2" />
        ))}
      </svg>
    ),
  },
  {
    href: "/cdu",
    name: "Cooling Distribution Units",
    art: (
      <svg viewBox="0 0 80 100" className="h-24 w-auto">
        <rect x="12" y="6" width="56" height="88" rx="3" fill="#d7dade" stroke="#b8bcc2" strokeWidth="2" />
        <circle cx="40" cy="36" r="16" fill="none" stroke="#005daa" strokeWidth="3" />
        <circle cx="40" cy="36" r="5" fill="#005daa" />
        {[62, 72, 82].map((y) => (
          <rect key={y} x="20" y={y} width="40" height="6" rx="2" fill="#b8bcc2" />
        ))}
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
      <h1 className="text-3xl font-bold sm:text-4xl">
        Power &amp; Cooling Distribution Configurators
      </h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PRODUCTS.map((product) => (
          <Link
            key={product.href}
            href={product.href}
            className="card pressable group flex items-center gap-5 p-6 hover:border-primary/50"
          >
            <div className="shrink-0">{product.art}</div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold leading-snug">{product.name}</h2>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Configure
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
