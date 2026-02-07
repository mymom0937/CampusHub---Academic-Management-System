import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/** Singleton Prisma client instance - SERVER ONLY */
// Longer timeouts so Neon can wake from suspend without P1008 / "Operation has timed out"
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30_000,
  query_timeout: 60_000, // client: wait up to 60s for query response (avoids SocketTimeout)
  statement_timeout: 60_000, // server: allow 60s per statement
})
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
