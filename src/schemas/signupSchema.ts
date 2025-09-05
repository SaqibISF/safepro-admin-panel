import z from "zod";
import { emailSchema, nameSchema } from "./zod-schemas";
import { choosePasswordSchema } from "./password-schema";

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: choosePasswordSchema,
  })
  .strict();
