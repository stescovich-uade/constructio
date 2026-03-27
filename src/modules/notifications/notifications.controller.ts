import type { Request, Response } from "express";
import { z } from "zod";
import { notificationsService } from "./notifications.service.js";

const notificationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const userId = req.auth!.userId;
  const notifications = await notificationsService.getUserNotifications(userId);
  res.status(200).json({ data: notifications });
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  const { id } = notificationIdParamSchema.parse(req.params);
  const userId = req.auth!.userId;
  await notificationsService.markAsRead(id, userId);
  res.status(204).send();
}
