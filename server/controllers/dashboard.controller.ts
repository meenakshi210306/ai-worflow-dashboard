import type { Request, Response } from "express";
import { HttpError } from "../utils/http-error";
import { getDashboardOverview } from "../services/dashboard.service";

export async function getDashboardOverviewController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const data = await getDashboardOverview(userId);

  res.status(200).json({
    success: true,
    data
  });
}
