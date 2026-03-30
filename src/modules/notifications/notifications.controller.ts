import type { Request, Response } from "express";
import { z } from "zod";
import {
  DEFAULT_NOTIFICATION_LIMIT,
  MAX_NOTIFICATION_LIMIT,
  notificationsService,
} from "./notifications.service.js";

const notificationIdParamSchema = z.object({
  id: z.string().uuid(),
});

const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_NOTIFICATION_LIMIT).optional(),
  cursor: z.string().min(1).optional(),
});

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  const userId = req.auth!.userId;
  const count = await notificationsService.getUnreadCount(userId);
  res.status(200).json({ count });
}

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const userId = req.auth!.userId;
  const query = listNotificationsQuerySchema.parse(req.query);
  const { items, nextCursor } = await notificationsService.getUserNotifications(userId, {
    limit: query.limit ?? DEFAULT_NOTIFICATION_LIMIT,
    cursor: query.cursor,
  });
  res.status(200).json({ data: items, nextCursor });
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  const { id } = notificationIdParamSchema.parse(req.params);
  const userId = req.auth!.userId;
  await notificationsService.markAsRead(id, userId);
  res.status(204).send();
}

export async function markAllNotificationsRead(req: Request, res: Response): Promise<void> {
  const userId = req.auth!.userId;
  await notificationsService.markAllAsRead(userId);
  res.status(204).send();
}
