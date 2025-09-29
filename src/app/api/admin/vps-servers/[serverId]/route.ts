import { apiHandlerWithAdminAuth } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";
import { z } from "zod";

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
    const updateVPSServerSchema = z.object({
      name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(255, "Name too long")
        .optional()
        .nullable(),
      username: z
        .string()
        .trim()
        .min(1, "Username is required")
        .max(255, "Username too long")
        .optional(),
      ipAddress: z
        .string()
        .trim()
        .min(1, "IP Address is required")
        .max(255, "IP Address too long")
        .optional(),
      privateKey: z.string().trim().optional().nullable(),
      password: z.string().trim().optional().nullable(),
      port: z.number().int().min(1).max(65535).optional(),
      domain: z
        .string()
        .trim()
        .max(255, "Domain too long")
        .optional()
        .nullable(),
      status: z.boolean().optional(),

      bandwidth: z.bigint().optional().nullable(),
      ramLimit: z.bigint().optional().nullable(),
      cpuLimit: z.bigint().optional().nullable(),
      diskLimit: z.bigint().optional().nullable(),
      bandWidthLimitPerSecond: z.bigint().optional().nullable(),

      healthScore: z.number().min(0).max(100).optional().nullable(),
      cpuUsage: z.number().min(0).max(100).optional().nullable(),
      ramUsage: z.number().min(0).max(100).optional().nullable(),
      diskUsage: z.number().min(0).max(100).optional().nullable(),
      totalMBitPerSecond: z.number().min(0).optional().nullable(),
    });

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
