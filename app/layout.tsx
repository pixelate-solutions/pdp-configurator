import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AppNavbar } from "@/components/AppNavbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Electro-Matic PDP Configurator",
  description: "Configure Siemens P5 panelboards and generate sellable BOMs.",
};

function OptionalClerkProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
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
