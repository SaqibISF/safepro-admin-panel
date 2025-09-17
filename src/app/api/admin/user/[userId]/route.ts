import { apiAdminAuthenticatedHandler } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { nameSchema } from "@/schemas/zod-schemas";

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

export const PATCH = apiAdminAuthenticatedHandler(
  async (req, { params }: { params: Promise<{ userId: string }> }) => {
    const updateUserSchema = z
      .object({
        name: nameSchema.optional(),
        role: z
          .literal(["user", "admin"], {
            error: "role expected only user or admin",
          })
          .optional(),

        emailVerified: z
          .literal(true, { error: "emailVerified expected true" })
          .optional(),

        banned: z.boolean({ error: "banned expected boolean" }).optional(),

        banReason: z
          .string({ error: "banReason expected string" })
          .trim()
          .min(1, "Banned reason is required")
          .nullable()
          .optional(),

        paddleId: z
          .string({ error: "paddleId expected string" })
          .nullable()
          .optional(),
        googleId: z
          .string({ error: "googleId expected string" })
          .nullable()
          .optional(),
        appleId: z
          .string({ error: "appleId expected string" })
          .nullable()
          .optional(),
      })
      .strict()
      .transform(
        async (
          incomingData
        ): Promise<
          Omit<typeof incomingData, "emailVerified" | "banned"> & {
            emailVerifiedAt?: Date;
            bannedAt?: Date | null;
          }
        > => {
          const data: typeof incomingData & {
            emailVerifiedAt?: Date;
            bannedAt?: Date | null;
          } = { ...incomingData };

          if (data.emailVerified) {
            delete data.emailVerified;
            const user = await prisma.user.findUnique({
              where: { id: userId },
            });
            if (user && !user.emailVerifiedAt) {
              data.emailVerifiedAt = new Date();
            }
          }

          if (typeof data.banned === "boolean") {
            if (data.banned) {
              data.bannedAt = new Date();
            } else {
              data.bannedAt = null;
              data.banReason = null;
            }
            delete data.banned;
          } else if (typeof data.banReason === "string") {
            data.banReason = undefined;
          }

          return data;
        }
      );

    const { userId } = await params;
    const body = await req.json();

    const data = await updateUserSchema.parseAsync(body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return Response.json(
      {
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  }
);
