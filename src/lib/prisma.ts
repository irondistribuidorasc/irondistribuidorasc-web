import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;
  
  // Force pgbouncer mode if not already set to fix "prepared statement already exists" error
  // This disables prepared statements which causes issues with connection pooling
  let connectionUrl = url;
  if (url && !url.includes("pgbouncer=true")) {
    connectionUrl += url.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  if (!globalThis.prisma) {
    console.log("Creating new PrismaClient instance");
    globalThis.prisma = db;
  } else {
    console.log("Reusing existing PrismaClient instance");
  }
}
