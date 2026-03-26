import { Router } from "express";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { requireMockAuth } from "../auth/auth.middleware.js";
import { createThread } from "./threads.controller.js";

export const threadsRouter = Router();

threadsRouter.post("/", requireMockAuth, asyncHandler(createThread));
