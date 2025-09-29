import { apiHandlerWithAuth } from "@/helpers/apiHandlers";
import { ACCESS_TOKEN_COOKIE_KEY } from "@/lib/constants";
import { cookies as nextCookies } from "next/headers";
import prisma from "@/lib/prisma";

export const POST = apiHandlerWithAuth(async (req) => {
  const cookies = await nextCookies();
  cookies.delete(ACCESS_TOKEN_COOKIE_KEY);

  await prisma.token.create({
    data: { accessToken: req.accessToken, expiryDate: req.accessTokenExpiry },
  });

  return Response.json(
    { success: true, message: "User logged out successfully" },
    { status: 200 }
  );
});
