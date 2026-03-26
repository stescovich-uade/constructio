import { Router } from "express";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { addCompanyToProject, createProject } from "./projects.controller.js";

export const projectsRouter = Router();

projectsRouter.post("/", asyncHandler(createProject));
projectsRouter.post("/:projectId/companies", asyncHandler(addCompanyToProject));
