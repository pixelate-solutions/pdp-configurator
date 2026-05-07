import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export async function assertAdmin() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return;

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
