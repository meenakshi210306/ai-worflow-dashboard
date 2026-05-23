import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  generateRefreshToken,
  generateToken,
  getTokenExpiryDate,
  hashToken,
  verifyRefreshToken
} from "../utils/jwt";
import { HttpError } from "../utils/http-error";

export type PublicUser = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthSession = {
  user: PublicUser;
  token: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

export type RegisterInput = {
  name?: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
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

async function createAuthSession(user: PublicUser, database: DatabaseClient): Promise<AuthSession> {
  const refreshToken = generateRefreshToken({
    userId: user.id,
    tokenId: crypto.randomUUID()
  });
  const refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);

  await database.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshTokenExpiresAt
    }
  });

  return {
    user,
    token: generateToken(user.id),
    refreshToken,
    refreshTokenExpiresAt
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthSession> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingUser) {
    throw new HttpError(409, "Email is already registered");
  }

  const password = await bcrypt.hash(input.password, 12);
  const email = input.email.toLowerCase();

  return prisma.$transaction(async (database) => {
    const user = await database.user.create({
      data: {
        name: input.name?.trim() || null,
        email,
        password
      },
      select: publicUserSelect
    });

    return createAuthSession(user, database);
  });
}

export async function loginUser(input: LoginInput): Promise<AuthSession> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });

  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);

  if (!passwordMatches) {
    throw new HttpError(401, "Invalid email or password");
  }

  const publicUser: PublicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  return prisma.$transaction(async (database) => {
    return createAuthSession(publicUser, database);
  });
}

export async function refreshAuthSession(refreshToken: string): Promise<AuthSession> {
  const refreshPayload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);
  const refreshRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash }
  });

  if (
    !refreshRecord ||
    refreshRecord.userId !== refreshPayload.userId ||
    refreshRecord.revokedAt ||
    refreshRecord.expiresAt.getTime() <= Date.now()
  ) {
    throw new HttpError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: refreshPayload.userId },
    select: publicUserSelect
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return prisma.$transaction(async (database) => {
    await database.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() }
    });

    return createAuthSession(user, database);
  });
}

export async function revokeRefreshToken(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
}

export async function getAuthenticatedUser(userId: string): Promise<PublicUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect
  });
}