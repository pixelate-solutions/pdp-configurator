import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AppNavbar } from "@/components/AppNavbar";
import { isClerkConfigured } from "@/lib/clerk-config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Electro-Matic PDP Configurator",
  description: "Configure Siemens P5 panelboards and generate sellable BOMs.",
};

function OptionalClerkProvider({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OptionalClerkProvider>
          <AppNavbar />
          {children}
        </OptionalClerkProvider>
      </body>
    </html>
  );
}
