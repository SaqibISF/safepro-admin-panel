import { apiAdminAuthenticatedHandler } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";

export const GET = apiAdminAuthenticatedHandler(
  async (_req, { params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return Response.json(
      { success: true, message: "User fetched successfully", user },
      { status: 200 }
    );
  }
);
