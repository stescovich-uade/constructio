import type { Notification, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../core/database/prisma.js";
import { HttpError } from "../../core/errors/http-error.js";

export const DEFAULT_NOTIFICATION_LIMIT = 20;
export const MAX_NOTIFICATION_LIMIT = 50;

export type NotificationListResult = {
  items: Notification[];
  nextCursor: string | null;
};

function encodeNotificationCursor(createdAt: Date, id: string): string {
  return Buffer.from(
    JSON.stringify({ v: 1, c: createdAt.toISOString(), id }),
    "utf8",
  ).toString("base64url");
}

function decodeNotificationCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as { v?: number; c?: string; id?: string };
    if (parsed.v !== 1 || typeof parsed.c !== "string" || typeof parsed.id !== "string") {
      return null;
    }
    if (!z.string().uuid().safeParse(parsed.id).success) {
      return null;
    }
    const createdAt = new Date(parsed.c);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }
    return { createdAt, id: parsed.id };
  } catch {
    return null;
  }
}

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

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },

  /**
   * Cursor is opaque (createdAt + id); rows are always filtered by `userId` so cursors cannot leak other users' data.
   */
  async getUserNotifications(
    userId: string,
    options?: { limit?: number; cursor?: string | null },
  ): Promise<NotificationListResult> {
    const rawLimit = options?.limit ?? DEFAULT_NOTIFICATION_LIMIT;
    const limit = Math.min(MAX_NOTIFICATION_LIMIT, Math.max(1, Math.floor(rawLimit)));

    let cursorPayload: { createdAt: Date; id: string } | null = null;
    if (options?.cursor !== undefined && options.cursor !== null && options.cursor !== "") {
      cursorPayload = decodeNotificationCursor(options.cursor);
      if (!cursorPayload) {
        throw new HttpError(400, "Invalid cursor");
      }
    }

    const rows = await prisma.notification.findMany({
      where: {
        userId,
        ...(cursorPayload
          ? {
              OR: [
                { createdAt: { lt: cursorPayload.createdAt } },
                {
                  AND: [{ createdAt: cursorPayload.createdAt }, { id: { lt: cursorPayload.id } }],
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];
    const nextCursor =
      hasMore && last ? encodeNotificationCursor(last.createdAt, last.id) : null;

    return { items, nextCursor };
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

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },
};
