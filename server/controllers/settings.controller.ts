import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../utils/http-error";
import {
  changePassword,
  updateProfile
} from "../services/settings.service";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(128)
});

export async function updateProfileController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const parsedBody = updateProfileSchema.parse(req.body);
  const user = await updateProfile(userId, {
    name: parsedBody.name!,
    email: parsedBody.email!
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user
  });
}

export async function changePasswordController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const parsedBody = changePasswordSchema.parse(req.body);
  await changePassword(userId, {
    currentPassword: parsedBody.currentPassword!,
    newPassword: parsedBody.newPassword!
  });

  res.status(200).json({
    success: true,
    message: "Password updated successfully"
  });
}
