import { ACCESS_TOKEN_COOKIE_KEY, ACCESS_TOKEN_SECRET } from "@/lib/constants";
import prisma from "@/lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies as nextCookies } from "next/headers";
import { ZodErrorResponse } from "@/helpers/zod-error-response";
import { ZodError } from "zod";

export const apiHandler =
  <T extends unknown[]>(
    handler: (req: Request, ...args: T) => Promise<Response>
  ) =>
  async (req: Request, ...args: T) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return ZodErrorResponse(error);
      }

      const message =
        error instanceof Error ? error.message : "Internal server error";
      return Response.json({ success: false, message }, { status: 500 });
    }
  };

export const apiHandlerWithAuth =
  <T extends unknown[]>(
    handler: (req: AuthRequest, ...args: T) => Promise<Response>
  ) =>
  async (req: Request, ...args: T) => {
    try {
      const cookies = await nextCookies();
      const accessTokenCookie = cookies.get(ACCESS_TOKEN_COOKIE_KEY);
      const bearerToken = req.headers.get("Authorization");

      if (!accessTokenCookie) {
        if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
          return Response.json(
            { success: false, message: "Unauthorized, you are not logged in" },
            { status: 401 }
          );
        }
      }

      const accessToken = (accessTokenCookie?.value ||
        bearerToken?.replace("Bearer ", ""))!;

      const isAccessTokenRevoked = await prisma.token.findUnique({
        where: { accessToken },
      });

      if (isAccessTokenRevoked) {
        cookies.delete(ACCESS_TOKEN_COOKIE_KEY);
        return Response.json(
          { success: false, message: "Unauthorized, token is revoked" },
          { status: 401 }
        );
      }

      const decodedToken = jwt.verify(accessToken, ACCESS_TOKEN_SECRET, {
        complete: true,
      });

      const payload = decodedToken.payload as JwtPayload;

      if (!payload.email) {
        cookies.delete(ACCESS_TOKEN_COOKIE_KEY);
        return Response.json(
          { success: false, message: "Unauthorized, token expired or invalid" },
          { status: 401 }
        );
      }

      const authReq = Object.assign(req, {
        user: { id: payload.id, email: payload.email },
        accessToken,
        accessTokenExpiry: new Date(payload.exp! * 1000),
      });

      return await handler(authReq, ...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return ZodErrorResponse(error);
      }

      const message =
        error instanceof Error ? error.message : "Internal server error";
      return Response.json({ success: false, message }, { status: 500 });
    }
  };

export const apiHandlerWithAdminAuth =
  <T extends unknown[]>(
    handler: (req: AuthRequest, ...args: T) => Promise<Response>
  ) =>
  async (req: Request, ...args: T) => {
    try {
      const cookies = await nextCookies();
      const accessToken = cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value;

      if (!accessToken) {
        return Response.json(
          { success: false, message: "Unauthorized, you are not logged in" },
          { status: 401 }
        );
      }

      const isAccessTokenRevoked = await prisma.token.findUnique({
        where: { accessToken },
      });

      if (isAccessTokenRevoked) {
        cookies.delete(ACCESS_TOKEN_COOKIE_KEY);
        return Response.json(
          { success: false, message: "Unauthorized, token is revoked" },
          { status: 401 }
        );
      }

      const decodedToken = jwt.verify(accessToken, ACCESS_TOKEN_SECRET, {
        complete: true,
      });

      const payload = decodedToken.payload as JwtPayload;

      if (!payload.email) {
        cookies.delete(ACCESS_TOKEN_COOKIE_KEY);
        return Response.json(
          { success: false, message: "Unauthorized, token expired or invalid" },
          { status: 401 }
        );
      }

      if (payload.role !== "admin") {
        return Response.json(
          { success: false, message: "Request Forbidden" },
          { status: 403 }
        );
      }

      const authReq = Object.assign(req, {
        user: { id: payload.id, email: payload.email },
        accessToken,
        accessTokenExpiry: new Date(payload.exp! * 1000),
      });

      return await handler(authReq, ...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return ZodErrorResponse(error);
      }

      const message =
        error instanceof Error ? error.message : "Internal server error";
      return Response.json({ success: false, message }, { status: 500 });
    }
  };
