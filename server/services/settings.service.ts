import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpError } from "../utils/http-error";

export type UpdateProfileInput = {
  name: string;
  email: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

async function getUserById(database: DatabaseClient, userId: string) {
  return database.user.findUnique({
    where: { id: userId }
  });
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const email = input.email.toLowerCase();
  const name = input.name.trim();

  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id: userId }
    }
  });

  if (existingUser) {
    throw new HttpError(409, "Email is already in use");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email
    },
    select: publicUserSelect
  });

  return updatedUser;
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await getUserById(prisma, userId);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const passwordMatches = await bcrypt.compare(input.currentPassword, user.password);

  if (!passwordMatches) {
    throw new HttpError(400, "Current password is incorrect");
  }

  const password = await bcrypt.hash(input.newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password }
  });

  return {
    success: true
  };
}
