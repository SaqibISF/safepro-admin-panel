import { apiHandler } from "@/helpers/apiHandlers";
import {
  ACCESS_TOKEN_COOKIE_KEY,
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
} from "@/lib/constants";
import { loginPrisma } from "@/lib/prisma";
import { isPasswordCorrect } from "@/schemas/password-schema";
import { signinSchema } from "@/schemas/signinSchema";
import jwt, { Secret } from "jsonwebtoken";
import { StringValue } from "ms";
import { cookies as nextCookies } from "next/headers";

export const POST = apiHandler(async (req) => {
  const body = await req.json();

  const { email, password } = signinSchema.parse(body);

  const user = await loginPrisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return Response.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  if (!isPasswordCorrect({ password, hash: user.password })) {
    return Response.json(
      { success: false, message: "Invalid Credentials" },
      { status: 401 }
    );
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
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
      user: {
        id: user.id,
        name: user.name,
        slug: user.slug,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
        role: user.role === "admin" ? user.role : undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    },
    { status: 200 }
  );
});
