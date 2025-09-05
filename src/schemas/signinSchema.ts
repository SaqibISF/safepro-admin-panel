import z from "zod";
import { emailSchema } from "./zod-schemas";
import { passwordSchema } from "./password-schema";

export const signinSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();
