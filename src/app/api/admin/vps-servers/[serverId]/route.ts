import { apiHandlerWithAdminAuth } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";
import { updateVPSServerSchema } from "@/schemas/vps-server-schemas";

export const GET = apiHandlerWithAdminAuth(
  async (_req, { params }: { params: Promise<{ serverId: string }> }) => {
    const { serverId } = await params;
    const vpsServer = await prisma.vPSServer.findUnique({
      where: { id: serverId },
    });
    return Response.json(
      { success: true, message: "VPS Server fetched successfully", vpsServer },
      { status: 200 }
    );
  }
);

export const PATCH = apiHandlerWithAdminAuth(
  async (req, { params }: { params: Promise<{ serverId: string }> }) => {
    const { serverId } = await params;
    const body = await req.json();

    const data = updateVPSServerSchema.parse(body);

    const vpsServer = await prisma.vPSServer.update({
      where: { id: serverId },
      data,
    });

    return Response.json(
      {
        success: true,
        message: "VPS Server updated successfully",
        vpsServer,
      },
      { status: 200 }
    );
  }
);

export const DELETE = apiHandlerWithAdminAuth(
  async (req, { params }: { params: Promise<{ serverId: string }> }) => {
    const { serverId } = await params;

    await prisma.vPSServer.delete({ where: { id: serverId } });

    return Response.json(
      {
        success: true,
        message: "VPS Server deleted successfully",
      },
      { status: 200 }
    );
  }
);
