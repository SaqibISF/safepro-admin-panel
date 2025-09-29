import { apiHandler } from "@/helpers/apiHandlers";
import {
  ACCESS_TOKEN_COOKIE_KEY,
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
} from "@/lib/constants";
import prisma, { loginPrisma } from "@/lib/prisma";
import { isPasswordCorrect } from "@/helpers/isPasswordCorrect";
import { signinSchema } from "@/schemas/signinSchema";
import jwt, { Secret } from "jsonwebtoken";
import { StringValue } from "ms";
import { cookies as nextCookies } from "next/headers";

export const POST = apiHandler(async (req) => {
  const body = await req.json();

  const { email, password } = signinSchema.parse(body);

  const user = await loginPrisma.user.findUnique({
    where: { email },
    select: { password: true, emailVerifiedAt: true, deletedAt: true },
  });

  if (!user) {
    return Response.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  const isAuthenticated = await isPasswordCorrect({
    password,
    hash: user.password,
  });

  if (!isAuthenticated) {
    return Response.json(
      { success: false, message: "Invalid Credentials" },
      { status: 401 }
    );
  }

  if (user.deletedAt) {
    const now = new Date();
    const diffMs = now.getTime() - user.deletedAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 3) {
      return Response.json(
        {
          success: false,
          message: "User was deleted, for restore contact to admin support",
        },
        { status: 410 }
      );
    } else {
      await prisma.user.update({ where: { email }, data: { deletedAt: null } });

      if (!user.emailVerifiedAt) {
        return Response.json(
          {
            success: false,
            message:
              "Your account was restored. Please verify your email to login.",
          },
          { status: 403 }
        );
      }
    }
  }

  if (!user.emailVerifiedAt) {
    return Response.json(
      {
        success: false,
        message: "Please verify your email before logging in.",
      },
      { status: 403 }
    );
  }

  const finalUser = await loginPrisma.user.update({
    where: { email },
    data: { lastLoginAt: new Date() },
    select: { id: true, name: true, slug: true, email: true },
  });

  const accessToken = jwt.sign(
    { id: finalUser.id, email: finalUser.email },
    ACCESS_TOKEN_SECRET as Secret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY as StringValue,
    }
  );

  const cookies = await nextCookies();
  cookies.set(ACCESS_TOKEN_COOKIE_KEY, accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 1,
    path: "/",
  });

  return Response.json(
    {
      success: true,
      message: "You are logged in successful",
      user: finalUser,
      accessToken,
    },
    { status: 200 }
  );
});
