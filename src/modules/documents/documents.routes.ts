import { Router } from "express";
import { documentsPlaceholder } from "./documents.controller.js";

export const documentsRouter = Router();

documentsRouter.all("*", documentsPlaceholder);
