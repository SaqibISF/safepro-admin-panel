import { apiHandlerWithAuth } from "@/helpers/apiHandlers";
import { isPasswordCorrect } from "@/helpers/isPasswordCorrect";
import { PASSWORD_ROUNDED_SALT } from "@/lib/constants";
import prisma, { loginPrisma } from "@/lib/prisma";
import {
  choosePasswordSchema,
  confirmPasswordSchema,
  passwordSchema,
} from "@/schemas/password-schema";
import { nameSchema } from "@/schemas/zod-schemas";
import bcrypt from "bcryptjs";
import z from "zod";

export const GET = apiHandlerWithAuth(async (req) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id, deletedAt: null },
  });

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
});

export const PATCH = apiHandlerWithAuth(async (req) => {
  const updateUserSchema = z
    .object({
      name: nameSchema.optional(),
      oldPassword: passwordSchema.optional(),
      newPassword: choosePasswordSchema.optional(),
      confirmPassword: confirmPasswordSchema.optional(),
      restore: z.literal(true, { error: "restore expected true" }).optional(),
    })
    .refine(
      (data) =>
        !data.restore ||
        Object.entries(data).filter(
          ([key, value]) =>
            key !== "restore" && value !== undefined && value !== null
        ).length === 0,
      {
        message: "No other fields allowed when restore is true",
        path: ["restore"],
      }
    )
    .refine((data) => !data.oldPassword || data.newPassword, {
      message: "newPassword expected",
      path: ["newPassword"],
    })
    .refine(
      (data) => !data.oldPassword || data.oldPassword !== data.newPassword,
      {
        message: "Please choose different password",
        path: ["newPassword"],
      }
    )
    .refine((data) => !data.newPassword || data.oldPassword, {
      message: "oldPassword expected",
      path: ["oldPassword"],
    })
    .refine((data) => !data.newPassword || data.confirmPassword, {
      message: "confirmPassword expected",
      path: ["confirmPassword"],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .strict();

  const body = await req.json();

  const data: z.infer<typeof updateUserSchema> & {
    password?: string;
    passwordResetAt?: Date;
  } = updateUserSchema.parse(body);

  if (data.restore) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id, NOT: { deletedAt: null } },
      select: { slug: true },
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found or not deleted" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id, NOT: { deletedAt: null } },
      data: { deletedAt: null },
    });

    return Response.json(
      {
        success: true,
        message: "User restored successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  }

  if (data.name) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id, deletedAt: null },
      select: { slug: true },
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
  }

  if (data.oldPassword) {
    const user = await loginPrisma.user.findUnique({
      where: { id: req.user.id, deletedAt: null },
      select: { password: true },
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isOldPasswordCorrect = await isPasswordCorrect({
      password: data.oldPassword,
      hash: user.password,
    });

    if (!isOldPasswordCorrect) {
      return Response.json(
        { success: false, message: "Old Password is incorrect" },
        { status: 401 }
      );
    }

    data.password = await bcrypt.hash(data.newPassword!, PASSWORD_ROUNDED_SALT);
    data.passwordResetAt = new Date();

    delete data.oldPassword;
    delete data.newPassword;
    delete data.confirmPassword;
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id, deletedAt: null },
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
});

export const DELETE = apiHandlerWithAuth(async (req) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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
    where: { id: req.user.id },
    data: { deletedAt: new Date() },
  });
  return Response.json(
    {
      success: true,
      message:
        "Your account has been deleted. You can restore it by logging in within the next 3 days. After that, your account will be permanently removed.",
    },
    { status: 200 }
  );
});
