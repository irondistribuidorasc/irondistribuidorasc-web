import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: string;
      approved?: boolean;
      phone?: string | null;
      docNumber?: string | null;
      addressLine1?: string | null;
      addressLine2?: string | null;
      city?: string | null;
      state?: string | null;
      postalCode?: string | null;
      storeName?: string | null;
      storePhone?: string | null;
      tradeLicense?: string | null;
    };
  }

  interface User extends DefaultUser {
    role?: string;
    approved?: boolean;
    phone?: string | null;
    docNumber?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    storeName?: string | null;
    storePhone?: string | null;
    tradeLicense?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    approved?: boolean;
    phone?: string | null;
    docNumber?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    storeName?: string | null;
    storePhone?: string | null;
    tradeLicense?: string | null;
  }
}
