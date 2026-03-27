import type { Notification, Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import { HttpError } from "../../core/errors/http-error.js";

export const notificationsService = {
  async createNotification(
    userId: string,
    type: string,
    entityId?: string | null,
    tx?: Prisma.TransactionClient,
  ): Promise<Notification> {
    const client = tx ?? prisma;
    return client.notification.create({
      data: {
        userId,
        type,
        entityId: entityId ?? null,
      },
    });
  },

  /**
   * One row per recipient; `recipientUserIds` is de-duplicated to avoid duplicate rows in the same batch.
   */
  async createNotificationsForUsers(
    recipientUserIds: string[],
    type: string,
    entityId: string | null | undefined,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const uniqueRecipients = [...new Set(recipientUserIds)];
    if (uniqueRecipients.length === 0) {
      return;
    }
    const client = tx ?? prisma;
    await client.notification.createMany({
      data: uniqueRecipients.map((uid) => ({
        userId: uid,
        type,
        entityId: entityId ?? null,
      })),
    });
  },

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
