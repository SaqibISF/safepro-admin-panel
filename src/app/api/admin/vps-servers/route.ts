import { Prisma } from "@/app/generated/prisma";
import { apiHandlerWithAdminAuth } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";
import { createVPSServerSchema } from "@/schemas/vps-server-schemas";

export const POST = apiHandlerWithAdminAuth(async (req) => {
  const body = await req.json();

  const data = createVPSServerSchema.parse(body);

  const vpsServer = await prisma.vPSServer.create({ data });

  return Response.json(
    { success: true, message: "VPS Server added successfully", vpsServer },
    { status: 201 }
  );
});

export const GET = apiHandlerWithAdminAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? "";

  const filters: Prisma.VPSServerWhereInput[] = JSON.parse(
    searchParams.get("filters") ?? "[]"
  );

  const skip = (page - 1) * limit;

  const where: Prisma.VPSServerWhereInput = {
    AND: filters.length ? filters : undefined,
    OR: search.trim()
      ? [
          { id: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { ipAddress: { contains: search, mode: "insensitive" } },
          { privateKey: { contains: search, mode: "insensitive" } },
          { domain: { contains: search, mode: "insensitive" } },
          {
            groups: {
              some: {
                OR: [
                  { role: { contains: search, mode: "insensitive" } },
                  {
                    vpsGroup: {
                      name: { contains: search, mode: "insensitive" },
                    },
                  },
                ],
              },
            },
          },
        ]
      : undefined,
  };

  const totalVPSServers = await prisma.vPSServer.count();

  const activeVPSServers = await prisma.vPSServer.count({
    where: { status: true },
  });

  const inactiveVPSServers = await prisma.vPSServer.count({
    where: { status: false },
  });

  // TODO: working pending to find connected users
  const totalConnectedUsers = 12;

  const total = await prisma.vPSServer.count({ where });

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
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      meta: {
        totalVPSServers,
        activeVPSServers,
        inactiveVPSServers,
        totalConnectedUsers,
      },
    },
    { status: 200 }
  );
});
