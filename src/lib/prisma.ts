import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line no-var -- Allow var for global Prisma declaration
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ['query'], // Uncomment to see Prisma queries in the console
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma; 