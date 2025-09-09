import { apiAuthenticatedHandler } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";

export const GET = apiAuthenticatedHandler(async (req) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  return Response.json(
    { success: true, message: "User fetched successfully", user },
    { status: 200 }
  );
});
