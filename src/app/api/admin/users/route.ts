import { Prisma } from "@/app/generated/prisma";
import { apiAdminAuthenticatedHandler } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";

export const GET = apiAdminAuthenticatedHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const role = searchParams.get("role") ?? "user";
  const search = searchParams.get("search") ?? "";

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    role,
    OR: search.trim()
      ? [
          { id: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ]
      : undefined,
  };

  const totalUsers = await prisma.user.count();

  const activeUsers = await prisma.user.count({
    where: { OR: [{ bannedAt: null }, { bannedAt: undefined }] },
  });

  const bannedUsers = await prisma.user.count({
    where: {
      OR: [{ NOT: { bannedAt: null } }, { NOT: { bannedAt: undefined } }],
    },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  const total = await prisma.user.count({ where });

  const users = await prisma.user.findMany({
    where,
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
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      meta: { totalUsers, activeUsers, bannedUsers, todayUsers },
    },
    { status: 200 }
  );
});
