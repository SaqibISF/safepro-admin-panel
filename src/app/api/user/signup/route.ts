import { apiHandler } from "@/helpers/apiHandlers";
import prisma, { signupPrisma } from "@/lib/prisma";
import { signupSchema } from "@/schemas/signupSchema";
import bcrypt from "bcryptjs";
import { PASSWORD_ROUNDED_SALT } from "@/lib/constants";

export const POST = apiHandler(async (req) => {
  const body = await req.json();
  const { name, email, password: passwd } = signupSchema.parse(body);

  const password = await bcrypt.hash(passwd, PASSWORD_ROUNDED_SALT);

  const existedUser = await prisma.user.findUnique({
    where: { email },
    select: { email: true },
  });

  if (existedUser) {
    return Response.json(
      { success: false, message: "This email has been already taken" },
      { status: 409 }
    );
  }

  const user = await signupPrisma.user.createWithSlug({
    data: { name, email, password },
    sourceField: "name",
    targetField: "slug",
    unique: true,
  });

  return Response.json(
    { success: true, message: "User created successfully", user },
    { status: 201 }
  );
});
