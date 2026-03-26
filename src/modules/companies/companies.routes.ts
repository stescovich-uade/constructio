import { Router } from "express";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { createCompany } from "./companies.controller.js";

export const companiesRouter = Router();

companiesRouter.post("/", asyncHandler(createCompany));
