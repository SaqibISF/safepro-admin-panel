import { Prisma } from "@/app/generated/prisma";
import { apiHandlerWithAdminAuth } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";
import { updateVPSGroupSchema } from "@/schemas/vps-groups-schemas";

export const GET = apiHandlerWithAdminAuth(
  async (_req, { params }: { params: Promise<{ groupId: string }> }) => {
    const { groupId } = await params;
    const vpsGroup = await prisma.vPSGroup.findUnique({
      where: { id: groupId },
    });
    return Response.json(
      { success: true, message: "VPS Group fetched successfully", vpsGroup },
      { status: 200 }
    );
  }
);

export const PATCH = apiHandlerWithAdminAuth(
  async (req, { params }: { params: Promise<{ groupId: string }> }) => {
    const { groupId } = await params;
    const body = await req.json();

    // If servers are present in the update, handle them via nested updateMany/set
    const { servers, ...groupData } = updateVPSGroupSchema.parse(body);

    const data: Prisma.XOR<
      Prisma.VPSGroupUpdateInput,
      Prisma.VPSGroupUncheckedUpdateInput
    > = { ...groupData };

    if (servers && servers.length) {
      data.servers = {
        deleteMany: {},
        create: servers.map((vpsServerId) => ({ vpsServerId })),
      };
    }

    const vpsGroup = await prisma.vPSGroup.update({
      where: { id: groupId },
      data,
      include: { servers: true },
    });

    return Response.json(
      {
        success: true,
        message: "VPS Group updated successfully",
        vpsGroup,
      },
      { status: 200 }
    );
  }
);

export const DELETE = apiHandlerWithAdminAuth(
  async (_req, { params }: { params: Promise<{ groupId: string }> }) => {
    const { groupId } = await params;

    await prisma.vPSGroup.delete({ where: { id: groupId } });

    return Response.json(
      {
        success: true,
        message: "VPS Group deleted successfully",
      },
      { status: 200 }
    );
  }
);
