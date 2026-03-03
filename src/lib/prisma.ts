import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  try {
    return new PrismaClient();
  } catch (error) {
    console.warn("Prisma Client could not be initialized. Using demo-only mode.");
    return null as any;
  }
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
