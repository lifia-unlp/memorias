import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrismaReadOnly = globalThis as unknown as {
  prismaReadOnly: PrismaClient | undefined;
};

// Connect with restricted read-only credentials; fall back to standard URL if not defined
const connectionString = process.env.DATABASE_READONLY_URL || process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prismaReadOnly =
  globalForPrismaReadOnly.prismaReadOnly ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrismaReadOnly.prismaReadOnly = prismaReadOnly;
}
