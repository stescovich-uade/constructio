import { Router } from "express";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { createUser } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.post("/", asyncHandler(createUser));
