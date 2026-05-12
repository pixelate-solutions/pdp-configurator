import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/clerk-config";
import type { PricingAccess } from "@/lib/pricing-access";

type ClerkEmailAddress = {
  emailAddress?: string | null;
  verification?: {
    status?: string | null;
  } | null;
};

function primaryVerifiedEmail(
  emailAddress: ClerkEmailAddress | null | undefined,
) {
  return {
    email: emailAddress?.emailAddress ?? null,
    emailVerified: emailAddress?.verification?.status === "verified",
  };
}

export async function getPricingAccess(): Promise<PricingAccess> {
  const clerkEnabled = isClerkConfigured();
  if (!clerkEnabled) {
    return {
      clerkEnabled: false,
      signedIn: false,
      emailVerified: false,
      email: null,
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return {
      clerkEnabled: true,
      signedIn: false,
      emailVerified: false,
      email: null,
    };
  }

  const user = await currentUser();
  const { email, emailVerified } = primaryVerifiedEmail(
    user?.primaryEmailAddress as ClerkEmailAddress | null | undefined,
  );

  return {
    clerkEnabled: true,
    signedIn: true,
    emailVerified,
    email,
  };
}

export async function assertAdmin() {
  if (!isClerkConfigured()) return;

  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/");

  const configuredAdmins = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const claims = sessionClaims as Record<string, unknown>;
  const publicMetadata = claims.publicMetadata as Record<string, unknown> | undefined;
  const metadata = claims.metadata as Record<string, unknown> | undefined;
  const role = publicMetadata?.role ?? metadata?.role;

  if (configuredAdmins.includes(userId) || role === "admin") return;

  redirect("/");
}
