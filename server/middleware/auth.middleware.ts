import type { NextFunction, Request, Response } from "express";
import { extractBearerToken, verifyAuthToken, type AuthTokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthTokenPayload;
      user?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req.header("authorization"));

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Missing or invalid authorization token"
    });
    return;
  }

  try {
    const decodedToken = verifyAuthToken(token);

    req.authUser = decodedToken;
    req.user = decodedToken;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token"
    });
  }
}