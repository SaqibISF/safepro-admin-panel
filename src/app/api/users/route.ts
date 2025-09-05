import prisma from "@/lib/prisma";

export const GET = async () => {
  try {
    const users = await prisma.user.findMany({ omit: { password: true } });
    return Response.json(
      { success: true, message: "Users fetched successfully", users },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetched users";
    return Response.json({ message }, { status: 500 });
  }
};
