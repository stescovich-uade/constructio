import type { Notification, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../core/database/prisma.js";
import { HttpError } from "../../core/errors/http-error.js";

export const DEFAULT_NOTIFICATION_LIMIT = 20;
export const MAX_NOTIFICATION_LIMIT = 50;

export type CreateNotificationParams = {
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  entityId?: string | null;
  tx?: Prisma.TransactionClient;
};

export type NotificationPayload = {
  type: string;
  title: string;
  body?: string | null;
  entityId?: string | null;
};

export type NotificationListResult = {
  items: Notification[];
  nextCursor: string | null;
};

export type NotificationGroup = {
  type: string;
  entityId: string | null;
  count: number;
  latestCreatedAt: Date;
  /** Up to the three most recent rows in this group (same order as list: newest first). */
  notifications: Notification[];
};

export type GroupedNotificationListResult = {
  groups: NotificationGroup[];
  nextCursor: string | null;
};

function utcCalendarDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function groupKey(n: Notification): string {
  const day = utcCalendarDay(n.createdAt);
  const entity = n.entityId ?? "";
  return `${n.type}\0${entity}\0${day}`;
}

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
  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    const client = params.tx ?? prisma;
    return client.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body ?? null,
        entityId: params.entityId ?? null,
      },
    });
  },

  /**
   * Bulk insert; recipient list is de-duplicated. Optional `tx` for same transaction as other writes.
   */
  async createManyNotifications(
    userIds: string[],
    payload: NotificationPayload,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const uniqueRecipients = [...new Set(userIds)];
    if (uniqueRecipients.length === 0) {
      return;
    }
    const client = tx ?? prisma;
    await client.notification.createMany({
      data: uniqueRecipients.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body ?? null,
        entityId: payload.entityId ?? null,
      })),
    });
  },

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },

  /** Single aggregate over `userId` (indexed); for lightweight poll vs previous timestamp. */
  async getLatestNotificationTimestamp(userId: string): Promise<Date | null> {
    const agg = await prisma.notification.aggregate({
      where: { userId },
      _max: { createdAt: true },
    });
    return agg._max.createdAt ?? null;
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

  /**
   * Fetches one paginated page via `getUserNotifications`, then merges rows that share
   * type + entityId + UTC calendar day. `nextCursor` matches the flat list pagination.
   */
  async getGroupedNotifications(
    userId: string,
    options?: { limit?: number; cursor?: string | null },
  ): Promise<GroupedNotificationListResult> {
    const { items, nextCursor } = await notificationsService.getUserNotifications(userId, options);

    const buckets = new Map<string, Notification[]>();
    for (const n of items) {
      const key = groupKey(n);
      const list = buckets.get(key);
      if (list) {
        list.push(n);
      } else {
        buckets.set(key, [n]);
      }
    }

    const groups: NotificationGroup[] = [];
    for (const notifs of buckets.values()) {
      const sorted = [...notifs].sort((a, b) => {
        const t = b.createdAt.getTime() - a.createdAt.getTime();
        if (t !== 0) {
          return t;
        }
        return b.id.localeCompare(a.id);
      });
      const latest = sorted[0]!;
      groups.push({
        type: latest.type,
        entityId: latest.entityId,
        count: sorted.length,
        latestCreatedAt: latest.createdAt,
        notifications: sorted.slice(0, Math.min(3, sorted.length)),
      });
    }

    groups.sort((a, b) => {
      const t = b.latestCreatedAt.getTime() - a.latestCreatedAt.getTime();
      if (t !== 0) {
        return t;
      }
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      const ae = a.entityId ?? "";
      const be = b.entityId ?? "";
      if (ae !== be) {
        return ae.localeCompare(be);
      }
      return 0;
    });

    return { groups, nextCursor };
  },

  /**
   * Marks one notification read; scoped by `userId` so another user's row is never updated.
   * Idempotent: repeated calls succeed if the row is already read.
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
    if (result.count > 0) {
      return;
    }
    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
      select: { read: true },
    });
    if (existing?.read === true) {
      return;
    }
    throw new HttpError(404, "Notification not found");
  },

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },
};
