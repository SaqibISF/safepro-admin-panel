import { apiHandlerWithAdminAuth } from "@/helpers/apiHandlers";
import prisma from "@/lib/prisma";
import { updateUserSchema } from "@/schemas/update-user-schema";
import z from "zod";

export const GET = apiHandlerWithAdminAuth(
  async (_req, { params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "User fetched successfully", user },
      { status: 200 }
    );
  }
);

export const PATCH = apiHandlerWithAdminAuth(
  async (req, { params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params;
    const body = await req.json();

    const data: z.infer<typeof updateUserSchema> & {
      emailVerifiedAt?: Date;
      bannedAt?: Date | null;
      deletedAt?: Date | null;
    } = updateUserSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { slug: true, emailVerifiedAt: true, deletedAt: true },
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (data.emailVerified) {
      delete data.emailVerified;

      if (!user.emailVerifiedAt) {
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

    if (data.restore) {
      if (!user.deletedAt) {
        return Response.json(
          { success: false, message: "This user was not deleted" },
          { status: 409 }
        );
      }
      delete data.restore;
      data.deletedAt = null;
    }

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

export const DELETE = apiHandlerWithAdminAuth(
  async (_req, { params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true },
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.deletedAt) {
      return Response.json(
        { success: false, message: "This user already deleted" },
        { status: 409 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return Response.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    );
  }
);
