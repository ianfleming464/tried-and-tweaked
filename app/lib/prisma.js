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

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

const prisma = new Proxy(
  {},
  {
    get(_target, prop, receiver) {
      const client = getPrismaClient();
      const value = Reflect.get(client, prop, receiver);
      return typeof value === 'function' ? value.bind(client) : value;
    },
  },
);

export default prisma;
