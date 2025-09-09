import { apiAdminAuthenticatedHandler } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";

export const GET = apiAdminAuthenticatedHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const role = searchParams.get("role") ?? "user";

  const skip = (page - 1) * limit;

  const totalUsers = await prisma.user.count({ where: { role } });

  const users = await prisma.user.findMany({
    where: { role },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return Response.json(
    {
      success: true,
      message: "Users fetched successfully",
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    },
    { status: 200 }
  );
});
