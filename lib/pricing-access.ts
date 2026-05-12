export type PricingAccess = {
  clerkEnabled: boolean;
  signedIn: boolean;
  emailVerified: boolean;
  email: string | null;
};

export const maskedPrice = "$XX,XXX.XX";
