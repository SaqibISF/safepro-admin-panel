import { Prisma } from "@/app/generated/prisma";
import { apiHandlerWithAdminAuth } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";
import { createVPSGroupSchema } from "@/schemas/vps-groups-schemas";

export const POST = apiHandlerWithAdminAuth(async (req) => {
  const body = await req.json();

  const { servers, ...groupData } = createVPSGroupSchema.parse(body);

  const data: Prisma.XOR<
    Prisma.VPSGroupCreateInput,
    Prisma.VPSGroupUncheckedCreateInput
  > = { ...groupData };

  if (servers && servers.length) {
    data.servers = {
      create: servers.map((vpsServerId) => ({ vpsServerId })),
    };
  }

  const vpsGroup = await prisma.vPSGroup.create({ data: data });

  return Response.json(
    { success: true, message: "VPS Group created successfully", vpsGroup },
    { status: 201 }
  );
});

export const GET = apiHandlerWithAdminAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? "";

  const filters: Prisma.VPSGroupWhereInput[] = JSON.parse(
    searchParams.get("filters") ?? "[]"
  );

  const skip = (page - 1) * limit;

  const where: Prisma.VPSGroupWhereInput = {
    AND: filters.length ? filters : undefined,
    OR: search.trim()
      ? [
          { id: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },

          {
            servers: {
              some: {
                OR: [
                  { role: { contains: search, mode: "insensitive" } },
                  {
                    vpsServer: {
                      OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { username: { contains: search, mode: "insensitive" } },
                        {
                          ipAddress: { contains: search, mode: "insensitive" },
                        },
                        {
                          privateKey: { contains: search, mode: "insensitive" },
                        },
                        { domain: { contains: search, mode: "insensitive" } },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ]
      : undefined,
  };

  const totalVPSGroups = await prisma.vPSGroup.count();

  const withServersGroups = await prisma.vPSGroup.count({
    where: { servers: { some: {} } },
  });

  const withoutServersGroups = await prisma.vPSGroup.count({
    where: { servers: { none: {} } },
  });

  const latestGroup = await prisma.vPSGroup.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.vPSGroup.count({ where });

  const vpsGroups = await prisma.vPSGroup.findMany({
    where,
    include: {
      servers: {
        select: {
          vpsServer: { select: { id: true, name: true, ipAddress: true } },
        },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const vpsServers = await prisma.vPSServer.findMany({
    select: { id: true, name: true },
  });

  const serverRoles = await prisma.vPSGroupServer.findMany({
    select: { role: true },
    where: { NOT: { role: null } },
    distinct: ["role"],
  });

  return Response.json(
    {
      success: true,
      message: "VPS Groups fetched successfully",
      vpsGroups,
      vpsServers,
      serverRoles,
      pagination: {
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      meta: {
        totalVPSGroups,
        withServersGroups,
        withoutServersGroups,
        latestGroup,
      },
    },
    { status: 200 }
  );
});
