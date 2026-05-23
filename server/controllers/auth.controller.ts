import type { CookieOptions, Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { getCookieValue } from "../utils/cookies";
import { HttpError } from "../utils/http-error";
import {
  type AuthSession,
  getAuthenticatedUser,
  loginUser,
  refreshAuthSession,
  registerUser,
  revokeRefreshToken
} from "../services/auth.service";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth"
};

function setRefreshTokenCookie(res: Response, refreshToken: string, refreshTokenExpiresAt: Date) {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...authCookieOptions,
    maxAge: Math.max(refreshTokenExpiresAt.getTime() - Date.now(), 0)
  });
}

function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, authCookieOptions);
}

function sendAuthSession(res: Response, statusCode: number, message: string, session: AuthSession) {
  setRefreshTokenCookie(res, session.refreshToken, session.refreshTokenExpiresAt);

  res.status(statusCode).json({
    success: true,
    message,
    token: session.token,
    user: session.user,
    data: {
      token: session.token,
      user: session.user
    }
  });
}

export async function registerController(req: Request, res: Response) {
  const parsedBody = registerSchema.parse(req.body);
  const session = await registerUser(parsedBody);

  sendAuthSession(res, 201, "User registered successfully", session);
}

export async function loginController(req: Request, res: Response) {
  const parsedBody = loginSchema.parse(req.body);
  const session = await loginUser(parsedBody);

  sendAuthSession(res, 200, "Login successful", session);
}

export async function refreshController(req: Request, res: Response) {
  const refreshToken = getCookieValue(req.headers.cookie, env.REFRESH_TOKEN_COOKIE_NAME);

  if (!refreshToken) {
    throw new HttpError(401, "Refresh token is required");
  }

  const session = await refreshAuthSession(refreshToken);

  sendAuthSession(res, 200, "Token refreshed successfully", session);
}

export async function logoutController(req: Request, res: Response) {
  const refreshToken = getCookieValue(req.headers.cookie, env.REFRESH_TOKEN_COOKIE_NAME);

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  clearRefreshTokenCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
}

export async function meController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
    return;
  }

  const user = await getAuthenticatedUser(userId);

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found"
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: user
  });
}