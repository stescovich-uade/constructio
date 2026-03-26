import { Router } from "express";
import { auditNotImplemented } from "./audit.controller.js";

export const auditRouter = Router();

auditRouter.get("/logs", auditNotImplemented);
