import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sensorRouter } from "./routes/sensor";
import { notificationsRouter } from "./routes/notifications";
import { authRouter } from "./routes/auth";
import { binsRouter } from "./routes/bins";
import { actionsRouter } from "./routes/actions";
import { healthRouter } from "./routes/health";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Smart Trash Bin Routes
  app.use("/api/sensor", sensorRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/bins", binsRouter);
  app.use("/api/actions", actionsRouter);
  app.use("/api/health", healthRouter);

  const httpServer = createServer(app);

  return httpServer;
}
