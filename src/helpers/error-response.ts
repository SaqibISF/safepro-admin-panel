import { Prisma } from "@/app/generated/prisma";
import { ZodError } from "zod";
import { ZodErrorResponse } from "./zod-error-response";
import { AxiosError } from "axios";

export const ErrorResponse = (error: unknown) => {
  if (error instanceof ZodError) {
    return ZodErrorResponse(error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const message = Array.isArray(error.meta?.target)
        ? error.meta.target.reduce(
            (prev, key) => `${prev ? "," : ""} ${key} must be unique`,
            ""
          )
        : "";

      return Response.json({ success: false, message }, { status: 409 });
    }
  }

  if (error instanceof AxiosError) {
    const message = error.response
      ? error.response.data.message
      : error.message;

    return Response.json({ success: false, message }, { status: error.status });
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";

  return Response.json({ success: false, message }, { status: 500 });
};
