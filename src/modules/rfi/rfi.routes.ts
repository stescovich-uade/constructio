import { Router } from "express";
import { rfiPlaceholder } from "./rfi.controller.js";

export const rfiRouter = Router();

rfiRouter.all("*", rfiPlaceholder);
