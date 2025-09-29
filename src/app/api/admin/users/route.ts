import { Prisma } from "@/app/generated/prisma";
import { apiHandlerWithAdminAuth } from "@/helpers/apiHandlers";
import prisma, { signupPrisma } from "@/lib/prisma";
import { apiHandler } from "@/helpers/apiHandlers";
import bcrypt from "bcryptjs";
import { PASSWORD_ROUNDED_SALT } from "@/lib/constants";
import { emailSchema, nameSchema } from "@/schemas/zod-schemas";
import { passwordSchema } from "@/schemas/password-schema";
import z from "zod";

export const POST = apiHandler(async (req) => {
  const body = await req.json();
  const createUserSchema = z
    .object({
      name: nameSchema,
      email: emailSchema,
      password: passwordSchema,
    })
    .strict();

  const { name, email, password: passwd } = createUserSchema.parse(body);

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

export const GET = apiHandlerWithAdminAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? "";

  const filters: Prisma.UserWhereInput[] | undefined = JSON.parse(
    searchParams.get("filters") ?? "[]"
  );

  if (filters) {
    let hasOnlyDeletedUsersFilter = false;
    let hasWithDeletedUsersFilter = false;

    for (const filter of filters) {
      if (filter.NOT && "deletedAt" in filter.NOT) {
        hasOnlyDeletedUsersFilter = true;
      }

      if (Object.keys(filter).length === 0) {
        hasWithDeletedUsersFilter = true;
      }

      if (hasOnlyDeletedUsersFilter || hasWithDeletedUsersFilter) break;
    }

    if (!hasOnlyDeletedUsersFilter && !hasWithDeletedUsersFilter) {
      filters.push({ deletedAt: null });
    }
  }

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    AND: filters ? filters : { deletedAt: null },
    OR: search.trim()
      ? [
          { id: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ]
      : undefined,
  };

  const totalUsers = await prisma.user.count({ where: { deletedAt: null } });

  const activeUsers = await prisma.user.count({
    where: {
      OR: [{ bannedAt: null }, { bannedAt: undefined }],
      deletedAt: null,
    },
  });

  const bannedUsers = await prisma.user.count({
    where: {
      OR: [{ NOT: { bannedAt: null } }, { NOT: { bannedAt: undefined } }],
      deletedAt: null,
    },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
      deletedAt: null,
    },
  });

  const total = await prisma.user.count({ where });

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return Response.json(
    {
      success: true,
      message: "Users fetched successfully",
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      meta: { totalUsers, activeUsers, bannedUsers, todayUsers },
    },
    { status: 200 }
  );
});
