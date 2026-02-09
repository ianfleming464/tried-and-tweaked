import { PrismaClient } from '@/app/generated/prisma';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis;

function readEnv(name) {
  const value = process.env[name];
  if (!value) return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;
  if (normalized === 'undefined' || normalized === 'null') return undefined;

  return normalized;
}

function createPrismaClient() {
  const databaseUrl = readEnv('DATABASE_URL');
  const tursoDatabaseUrl = readEnv('TURSO_DATABASE_URL');
  const tursoUrl = tursoDatabaseUrl || (databaseUrl?.startsWith('libsql://') ? databaseUrl : undefined);

  if (databaseUrl?.startsWith('file:')) {
    return new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  if (!tursoUrl) {
    throw new Error(
      'Database configuration error: set TURSO_DATABASE_URL (libsql://...) or DATABASE_URL (file:... locally / libsql://... in production).',
    );
  }

  const libsql = createClient({
    url: tursoUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({
    adapter,
    datasources: {
      db: {
        url: tursoUrl,
      },
    },
  });
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
