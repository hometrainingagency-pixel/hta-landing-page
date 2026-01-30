import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerAdminAuthRoutes, initAdminUser } from "./adminAuth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { requestLogger, errorHandler, securityHeaders, rateLimit } from "./middleware";
import { logger } from "./logger";
import { closeDb } from "../db";
import { ENV } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security headers
  app.use(securityHeaders);

  // Cookie parser (nécessaire pour l'auth admin)
  app.use(cookieParser());

  // Request logging
  app.use(requestLogger);

  // Rate limiting (500 requests per minute per IP)
  app.use(rateLimit(60000, 500));

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Admin authentication routes
  registerAdminAuthRoutes(app);

  // Initialize admin user
  await initAdminUser();

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (ENV.isProduction) {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  // Error handling middleware (must be last)
  app.use(errorHandler);

  const port = await findAvailablePort(ENV.port);

  if (port !== ENV.port) {
    logger.warn(`Port ${ENV.port} is busy, using port ${port} instead`);
  }

  // Graceful shutdown
  const shutdown = async () => {
    logger.info("Shutting down server...");
    server.close(async () => {
      await closeDb();
      logger.info("Server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  server.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}/`, {
      environment: ENV.isProduction ? "production" : "development",
      port,
    });
  });
}

startServer().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
