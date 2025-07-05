import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/environment";
import { logger } from "./utils/logger";
import { setupRoutes } from "./routes";
import { initializeDatabase } from "./database/connection";
import { initializeQueues } from "./services/QueueService";
import { NotificationService } from "./services/NotificationService";

class NotificationServiceApp {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: config.cors.origins,
        credentials: true,
      })
    );

    // Rate limiting
    this.app.use(
      rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        message: "Too many requests from this IP",
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info("Incoming request", {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });
      next();
    });
  }

  private setupRoutes(): void {
    setupRoutes(this.app);
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Endpoint not found",
        },
      });
    });

    // Global error handler
    this.app.use(
      (
        error: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        logger.error("Unhandled error", {
          error: error.message,
          stack: error.stack,
          path: req.path,
          method: req.method,
        });

        res.status(error.statusCode || 500).json({
          success: false,
          error: {
            code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message || "Internal server error",
          },
        });
      }
    );
  }

  async start(): Promise<void> {
    try {
      // Initialize external services
      await this.initializeServices();

      // Start server
      this.server = this.app.listen(config.app.port, () => {
        logger.info(`Notification Service started`, {
          port: config.app.port,
          env: config.app.env,
          version: config.app.version,
        });
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error("Failed to start notification service", { error });
      process.exit(1);
    }
  }

  private async initializeServices(): Promise<void> {
    logger.info("Initializing notification service...");

    // Initialize database
    await initializeDatabase();

    // Initialize queues
    await initializeQueues();

    // Initialize notification service
    await NotificationService.getInstance().initialize();

    logger.info("Notification service initialized successfully");
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      if (this.server) {
        this.server.close(async () => {
          logger.info("HTTP server closed");
          await this.cleanup();
          process.exit(0);
        });
      }
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  }

  private async cleanup(): Promise<void> {
    try {
      logger.info("Cleaning up notification service...");

      // Cleanup notification service
      await NotificationService.getInstance().cleanup();

      logger.info("Cleanup completed");
    } catch (error) {
      logger.error("Error during cleanup", { error });
    }
  }
}

// Start the service
const service = new NotificationServiceApp();
service.start().catch((error) => {
  logger.error("Failed to start service", { error });
  process.exit(1);
});

export default service;
