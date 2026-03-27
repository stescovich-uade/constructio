import { Router } from "express";
import { requireMockAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { listNotifications, markNotificationRead } from "./notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireMockAuth, asyncHandler(listNotifications));
notificationsRouter.patch("/:id/read", requireMockAuth, asyncHandler(markNotificationRead));
