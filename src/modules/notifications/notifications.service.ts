import type { Notification } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import { HttpError } from "../../core/errors/http-error.js";

export const notificationsService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
    if (result.count === 0) {
      throw new HttpError(404, "Notification not found");
    }
  },
};
