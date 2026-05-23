import crypto from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export type AuthTokenPayload = JwtPayload & {
  userId: string;
};

export type RefreshTokenPayload = JwtPayload & {
  userId: string;
  tokenId: string;
};

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

export const generateRefreshToken = (payload: Pick<RefreshTokenPayload, "userId" | "tokenId">) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

export function verifyAuthToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getTokenExpiryDate(token: string) {
  const decodedToken = jwt.decode(token);

  if (decodedToken && typeof decodedToken === "object" && typeof decodedToken.exp === "number") {
    return new Date(decodedToken.exp * 1000);
  }

  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export function extractBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}