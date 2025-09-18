import { Prisma } from "@/app/generated/prisma";
import { apiAdminAuthenticatedHandler } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";

export const GET = apiAdminAuthenticatedHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? "";

  const skip = (page - 1) * limit;

  const where: Prisma.VPSServerWhereInput = {
    OR: search.trim()
      ? [
          { id: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { ipAddress: { contains: search, mode: "insensitive" } },
          { privateKey: { contains: search, mode: "insensitive" } },
          { domain: { contains: search, mode: "insensitive" } },
        ]
      : undefined,
  };

  const totalVPSServers = await prisma.vPSServer.count({ where });

  const vpsServers = await prisma.vPSServer.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return Response.json(
    {
      success: true,
      message: "VPS Servers fetched successfully",
      vpsServers,
      pagination: {
        total: totalVPSServers,
        page,
        limit,
        totalPages: Math.ceil(totalVPSServers / limit),
      },
    },
    { status: 200 }
  );
});
