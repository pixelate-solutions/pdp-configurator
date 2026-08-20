import type { Metadata } from "next";
import { Open_Sans, Titillium_Web } from "next/font/google";
import { AppSidebar } from "@/components/AppSidebar";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
});

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Electro-Matic Configurators",
  description:
    "Configure Electro-Matic power distribution products: panelboards, PDPs, PDUs, RPPs, and CDUs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} ${titillium.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col lg:flex-row">
          <AppSidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
