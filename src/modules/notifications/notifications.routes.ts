import { Router } from "express";
import { requireMockAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import {
  getLastNotificationTimestamp,
  getUnreadCount,
  listGroupedNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.get("/unread-count", requireMockAuth, asyncHandler(getUnreadCount));
notificationsRouter.get("/last", requireMockAuth, asyncHandler(getLastNotificationTimestamp));
notificationsRouter.patch("/read-all", requireMockAuth, asyncHandler(markAllNotificationsRead));
notificationsRouter.get("/grouped", requireMockAuth, asyncHandler(listGroupedNotifications));
notificationsRouter.get("/", requireMockAuth, asyncHandler(listNotifications));
notificationsRouter.patch("/:id/read", requireMockAuth, asyncHandler(markNotificationRead));
