import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const basePrisma = new PrismaClient({ adapter });

export const prisma =
  globalForPrisma.prisma ??
  basePrisma.$extends({
    query: {
      user: {
        async create({ args, query }) {
          const count = await basePrisma.user.count();
          if (count === 0) {
            // First user to register becomes the active ADMIN
            args.data.role = "ADMIN";
            args.data.active = true;
          }
          return query(args);
        },
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
