import { PrismaClient } from '@/app/generated/prisma';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis;

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  const tursoUrl =
    process.env.TURSO_DATABASE_URL ||
    (databaseUrl?.startsWith('libsql://') ? databaseUrl : undefined);

  if (databaseUrl?.startsWith('file:')) {
    return new PrismaClient();
  }

  if (!tursoUrl) {
    throw new Error(
      'Database configuration error: set TURSO_DATABASE_URL or a libsql:// DATABASE_URL in your server environment.',
    );
  }

  const libsql = createClient({
    url: tursoUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
