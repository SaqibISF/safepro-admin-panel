import { PrismaClient } from "../app/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createWithSlugFn } from "prisma-extension-create-with-slug";

// const globalForPrisma = global as unknown as {
//   prisma: PrismaClient;
// };

const loginPrisma = new PrismaClient().$extends(withAccelerate());
const signupPrisma = new PrismaClient({ omit: { user: { password: true } } })
  .$extends(withAccelerate())
  .$extends(createWithSlugFn());

const prisma =
  // globalForPrisma.prisma ||
  new PrismaClient({ omit: { user: { password: true } } }).$extends(
    withAccelerate()
  );

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { loginPrisma, signupPrisma };

export default prisma;
