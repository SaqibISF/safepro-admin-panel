import { apiHandler } from "@/helpers/apiHandler";
import { loginPrisma } from "@/lib/prisma";
import { isPasswordCorrect } from "@/schemas/password-schema";
import { signinSchema } from "@/schemas/signinSchema";

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();

  const { email, password } = signinSchema.parse(body);

  const user = await loginPrisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return Response.json(
      { success: false, message: "User not found" },
      { status: 401 }
    );
  }

  if (!isPasswordCorrect({ password, hash: user.password })) {
    return Response.json(
      { success: false, message: "Invalid Credentials" },
      { status: 401 }
    );
  }

  return Response.json(
    {
      success: true,
      message: "Login successful",
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
    },
    { status: 200 }
  );
});
