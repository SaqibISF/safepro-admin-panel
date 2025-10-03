import z from "zod";

export const createVPSGroupSchema = z
  .object({
    name: z
      .string({ error: "Name expected a string" })
      .trim()
      .min(1, "Name is required")
      .max(255, "Name too long"),
    description: z
      .string({ error: "description expected a string" })
      .trim()
      .min(1, "description is required")
      .max(255, "description too long")
      .optional()
      .nullable(),
    servers: z.array(z.string().min(1, "Server ID is required")).optional(),
  })
  .strict();

export const updateVPSGroupSchema = z
  .object({
    name: z
      .string({ error: "Name expected a string" })
      .trim()
      .min(1, "Name is required")
      .max(255, "Name too long")
      .optional(),
    description: z
      .string({ error: "description expected a string" })
      .trim()
      .min(1, "description is required")
      .max(255, "description too long")
      .optional()
      .nullable(),
    servers: z.array(z.string().min(1, "Server ID is required")).optional(),
  })
  .strict();
