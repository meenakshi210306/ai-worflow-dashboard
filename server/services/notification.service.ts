import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export type NotificationRecord = {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  metadata: unknown;
  isRead: boolean;
  createdAt: Date;
};

export type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: unknown;
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl ?? null,
      metadata: input.metadata as Prisma.InputJsonValue
    }
  });
}

export async function listNotifications(userId: string) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.notification.count({
      where: { userId, isRead: false }
    })
  ]);

  return {
    notifications,
    unreadCount
  };
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId }
  });

  if (!notification) {
    return null;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
}
