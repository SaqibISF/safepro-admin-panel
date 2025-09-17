import { apiAuthenticatedHandler } from "@/helpers/apiHandlers";
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

export const GET = apiAuthenticatedHandler(async (req) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  return Response.json(
    { success: true, message: "User fetched successfully", user },
    { status: 200 }
  );
});

export const PATCH = apiAuthenticatedHandler(async (req) => {
  const updateUserSchema = z
    .object({
      name: nameSchema.optional(),
      oldPassword: passwordSchema.optional(),
      newPassword: choosePasswordSchema.optional(),
      confirmPassword: confirmPasswordSchema.optional(),
    })
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

  if (data.oldPassword) {
    const user = await loginPrisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true },
    });

    const isOldPasswordCorrect = await isPasswordCorrect({
      password: data.oldPassword,
      hash: user!.password,
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
    where: { id: req.user.id },
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
