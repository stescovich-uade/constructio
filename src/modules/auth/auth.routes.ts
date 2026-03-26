import { Router } from "express";
import { getMe } from "./auth.controller.js";

export const authRouter = Router();

authRouter.get("/me", getMe);
