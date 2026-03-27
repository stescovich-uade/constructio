import express from "express";
import { getEnv } from "./config/env.js";
import { errorHandler } from "./core/middleware/error-handler.js";
import { notFoundHandler } from "./core/middleware/not-found.js";
import { auditRouter } from "./modules/audit/audit.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { mockAuthMiddleware } from "./modules/auth/auth.middleware.js";
import { companiesRouter } from "./modules/companies/companies.routes.js";
import { documentsRouter } from "./modules/documents/documents.routes.js";
import { projectsRouter } from "./modules/projects/projects.routes.js";
import { rfiRouter } from "./modules/rfi/rfi.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";
import { threadsRouter } from "./modules/threads/threads.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(mockAuthMiddleware);

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use("/auth", authRouter);
  app.use("/companies", companiesRouter);
  app.use("/users", usersRouter);
  app.use("/projects", projectsRouter);
  app.use("/threads", threadsRouter);
  app.use("/documents", documentsRouter);
  app.use("/rfi", rfiRouter);
  app.use("/audit", auditRouter);
  app.use("/notifications", notificationsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const env = getEnv();
const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
});
