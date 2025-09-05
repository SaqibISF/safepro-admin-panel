import { ZodErrorResponse } from "@/helpers/zod-error-response";
import { ZodError } from "zod";

export const apiHandler =
  (handler: (req: Request) => Promise<Response>) => async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof ZodError) {
        return ZodErrorResponse(error);
      }

      const message =
        error instanceof Error ? error.message : "Internal server error";
      return Response.json({ message }, { status: 500 });
    }
  };
