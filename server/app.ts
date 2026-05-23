import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import aiRoutes from "./routes/ai.route";
import authRoutes from "./routes/auth.route";
import dashboardRoutes from "./routes/dashboard.route";
import healthRouter from "./routes/health.route";
import notificationRoutes from "./routes/notifications.route";
import settingsRoutes from "./routes/settings.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import searchRoutes from "./routes/search.route";
import { requireAuth } from "./middleware/auth.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/", healthRouter);
  app.use("/api", healthRouter);
  app.use("/api/auth", authRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/search", searchRoutes);

  app.get("/api/profile", requireAuth, (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user
    });
  });

  app.get("/", (_req, res) => {
    res.json({
      message: "AI Workflow Dashboard API",
      version: "0.1.0"
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
