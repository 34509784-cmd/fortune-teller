import { PrismaClient } from '@prisma/client';

const isVercelServerless = process.env.VERCEL === '1';

// No-op proxy returns null/empty for all DB operations
const noopProxy = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const name = String(prop);
    if (['user', 'baziReading', 'baguaReading', 'qimenReading', 'zodiacReading'].includes(name)) {
      return new Proxy({}, {
        get() { return (_args: any) => Promise.resolve(null); },
      });
    }
    if (name.startsWith('$')) return () => Promise.resolve();
    return (_args: any) => Promise.resolve(null);
  },
});

// Real Prisma client (used in local dev / normal deployment)
let realPrisma: PrismaClient | null = null;
function getRealPrisma(): PrismaClient {
  if (!realPrisma) realPrisma = new PrismaClient();
  return realPrisma;
}

export const prisma: PrismaClient = isVercelServerless ? noopProxy : getRealPrisma();
