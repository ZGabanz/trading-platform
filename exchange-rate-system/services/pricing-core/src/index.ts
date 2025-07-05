import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { config } from "./config/environment";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";
import { metricsMiddleware } from "./middleware/metrics";
import pricingRoutes from "./routes/pricing";
import { healthRoutes } from "./routes/health";
import { configRoutes } from "./routes/config";

/**
 * Pricing Core Service
 * Main entry point for the exchange rate pricing system
 */
class PricingCoreService {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupSwagger();
  }

  /**
   * Setup Express middleware
   */
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
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: config.rateLimit.max,
      message: "Too many requests from this IP",
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parsing and compression
    this.app.use(compression());
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    this.app.use(
      morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
      })
    );

    // Metrics collection
    this.app.use(metricsMiddleware);

    // Authentication (skip for health checks)
    // this.app.use("/api", authMiddleware);
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check routes (no auth required)
    this.app.use("/health", healthRoutes);

    // API routes
    this.app.use("/api/v1/pricing", pricingRoutes);
    this.app.use("/api/v1/config", configRoutes);

    // Root route
    this.app.get("/", (req, res) => {
      res.json({
        service: "Pricing Core Service",
        version: config.app.version,
        status: "running",
        timestamp: new Date().toISOString(),
      });
    });

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
        method: req.method,
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Setup Swagger documentation
   */
  private setupSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Pricing Core Service API",
          version: config.app.version,
          description: "Exchange rate calculation and spread management API",
          contact: {
            name: "Development Team",
            email: "dev@company.com",
          },
        },
        servers: [
          {
            url: `http://localhost:${config.app.port}`,
            description: "Development server",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      // Initialize database connections, cache, etc.
      await this.initializeServices();

      this.server = this.app.listen(config.app.port, () => {
        logger.info(`Pricing Core Service started on port ${config.app.port}`, {
          service: "pricing-core",
          port: config.app.port,
          environment: config.app.env,
          version: config.app.version,
        });
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error("Failed to start Pricing Core Service", error);
      process.exit(1);
    }
  }

  /**
   * Initialize external services
   */
  private async initializeServices(): Promise<void> {
    logger.info("Initializing services...");

    // TODO: Initialize database connection
    // TODO: Initialize Redis connection
    // TODO: Initialize message queues
    // TODO: Initialize external API clients

    logger.info("Services initialized successfully");
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      if (this.server) {
        this.server.close(async () => {
          logger.info("HTTP server closed");

          // Close database connections, cache, etc.
          await this.cleanup();

          logger.info("Graceful shutdown completed");
          process.exit(0);
        });
      } else {
        await this.cleanup();
        process.exit(0);
      }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    try {
      // TODO: Close database connections
      // TODO: Close Redis connections
      // TODO: Close message queue connections
      logger.info("Cleanup completed");
    } catch (error) {
      logger.error("Error during cleanup", error);
    }
  }
}

// Start the service
const service = new PricingCoreService();

if (require.main === module) {
  service.start().catch((error) => {
    logger.error("Failed to start service", error);
    process.exit(1);
  });
}

export default service;
