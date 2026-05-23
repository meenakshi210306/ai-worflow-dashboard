import type { Request, Response } from "express";
import { HttpError } from "../utils/http-error";
import { listNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../services/notification.service";

export async function listNotificationsController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const data = await listNotifications(userId);

  res.status(200).json({
    success: true,
    data
  });
}

export async function markNotificationReadController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const { id } = req.params;
  const notificationId = Array.isArray(id) ? id[0] : id;

  if (!notificationId) {
    throw new HttpError(400, "Notification id is required");
  }

  const notification = await markNotificationAsRead(userId, notificationId);

  if (!notification) {
    throw new HttpError(404, "Notification not found");
  }

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification
  });
}

export async function markAllNotificationsReadController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  await markAllNotificationsAsRead(userId);

  res.status(200).json({
    success: true,
    message: "Notifications marked as read"
  });
}
