import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten()
    });

    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });

    return;
  }

  const statusCode = typeof err === "object" && err !== null && "statusCode" in err && typeof (err as { statusCode?: number }).statusCode === "number"
    ? (err as { statusCode: number }).statusCode
    : 500;

  const message = err instanceof Error ? err.message : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message
  });
}
