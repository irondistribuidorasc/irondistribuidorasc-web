import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type {
  DefaultSession,
  NextAuthOptions,
  User as NextAuthUser,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import { getServerSession } from "next-auth";
import { db } from "@/src/lib/prisma";
import { isValidEmail, normalizeEmail } from "@/src/lib/validation";

type AuthUser = NextAuthUser & {
  phone?: string | null;
  docNumber?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
};

type SessionUser = DefaultSession["user"] & {
  id: string;
  phone?: string | null;
  docNumber?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
};

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null;

// TODO: Implementar rate limiting para tentativas de login
// Sugestão: usar middleware ou biblioteca como @upstash/ratelimit
// Proteger contra ataques de brute force
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const normalizedEmail = normalizeEmail(credentials.email);
        if (!isValidEmail(normalizedEmail)) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user?.hashedPassword) {
          return null;
        }

        const isValid = await compare(credentials.password, user.hashedPassword);
        if (!isValid) {
          return null;
        }

        const safeUser: AuthUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          phone: user.phone,
          docNumber: user.docNumber,
          addressLine1: user.addressLine1,
          addressLine2: user.addressLine2,
          city: user.city,
          state: user.state,
          postalCode: user.postalCode,
        };

        return safeUser;
      },
    }),
    ...(googleProvider ? [googleProvider] : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const authUser = user as AuthUser | undefined;
      if (authUser) {
        token.id = authUser.id;
        token.phone = authUser.phone ?? token.phone ?? null;
        token.docNumber = authUser.docNumber ?? token.docNumber ?? null;
        token.addressLine1 = authUser.addressLine1 ?? token.addressLine1 ?? null;
        token.addressLine2 = authUser.addressLine2 ?? token.addressLine2 ?? null;
        token.city = authUser.city ?? token.city ?? null;
        token.state = authUser.state ?? token.state ?? null;
        token.postalCode = authUser.postalCode ?? token.postalCode ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as SessionUser;
        sessionUser.id = token.id ?? sessionUser.id;
        sessionUser.phone = token.phone ?? null;
        sessionUser.docNumber = token.docNumber ?? null;
        sessionUser.addressLine1 = token.addressLine1 ?? null;
        sessionUser.addressLine2 = token.addressLine2 ?? null;
        sessionUser.city = token.city ?? null;
        sessionUser.state = token.state ?? null;
        sessionUser.postalCode = token.postalCode ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

export const auth = () => getServerSession(authOptions);
