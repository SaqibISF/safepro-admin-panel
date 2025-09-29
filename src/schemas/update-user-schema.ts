import z from "zod";
import { nameSchema } from "./zod-schemas";

export const updateUserSchema = z
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
  .strict();
