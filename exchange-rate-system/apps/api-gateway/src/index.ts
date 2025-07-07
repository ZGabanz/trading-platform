import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import jwt from "jsonwebtoken";
import session from "express-session";

/**
 * API Gateway
 * Central entry point for all microservices in the exchange rate system
 */
class ApiGateway {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupAuth();
    this.setupRoutes();
    this.setupProxies();
    this.setupSwagger();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration for Render deployment
    const corsOptions = {
      origin: [
        "http://localhost:3000", // Development frontend
        "http://localhost:3001", // Alternative dev port
        process.env.CORS_ORIGIN ||
          "https://trading-platform-frontend-hgjo.onrender.com", // Production frontend
        /.*\.onrender\.com$/, // Allow all Render deployments
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-requested-with",
        "x-api-key",
      ],
      optionsSuccessStatus: 200,
    };

    this.app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
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
    this.app.use(morgan("combined"));
  }

  private setupAuth(): void {
    // Simple session configuration without Redis for now
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || "default-session-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // Set to true in production with HTTPS
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
      })
    );

    // JWT authentication middleware
    const authenticateToken = (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Access token required" });
      }

      jwt.verify(
        token,
        process.env.JWT_SECRET || "default-jwt-secret",
        (err: any, user: any) => {
          if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
          }
          (req as any).user = user;
          next();
        }
      );
    };

    // Auth routes
    this.app.post(
      "/auth/login",
      async (req: express.Request, res: express.Response) => {
        try {
          const { username, password } = req.body;

          // Mock authentication - replace with real auth logic
          if (username === "admin" && password === "admin123") {
            const token = jwt.sign(
              {
                id: 1,
                username: "admin",
                role: "admin",
                permissions: ["read", "write", "admin"],
              },
              process.env.JWT_SECRET || "default-jwt-secret",
              { expiresIn: "24h" }
            );

            (req as any).session.user = {
              id: 1,
              username: "admin",
              role: "admin",
            };

            res.json({
              token,
              user: {
                id: 1,
                username: "admin",
                role: "admin",
                permissions: ["read", "write", "admin"],
              },
            });
          } else {
            res.status(401).json({ error: "Invalid credentials" });
          }
        } catch (error) {
          res.status(500).json({ error: "Authentication failed" });
        }
      }
    );

    this.app.post(
      "/auth/logout",
      (req: express.Request, res: express.Response) => {
        (req as any).session.destroy((err: any) => {
          if (err) {
            return res.status(500).json({ error: "Logout failed" });
          }
          res.json({ message: "Logged out successfully" });
        });
      }
    );

    this.app.get(
      "/auth/me",
      authenticateToken,
      (req: express.Request, res: express.Response) => {
        res.json({ user: (req as any).user });
      }
    );

    // Store auth middleware for later use
    (this.app as any).authenticateToken = authenticateToken;
  }

  private setupRoutes(): void {
    // Health check
    this.app.get("/health", (req: express.Request, res: express.Response) => {
      res.json({
        service: "API Gateway",
        status: "running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          "pricing-core": "http://pricing-core:4001",
          "p2p-parser": "http://p2p-parser:4002",
          "rapira-parser": "http://rapira-parser:4003",
          "deal-automation": "http://deal-automation:4004",
          "notification-service": "http://notification-service:4005",
          "reporting-service": "http://reporting-service:4006",
        },
      });
    });

    // Service status endpoints
    this.app.get(
      "/api/v1/status",
      async (req: express.Request, res: express.Response) => {
        try {
          const services = [
            { name: "pricing-core", url: "http://pricing-core:4001/health" },
            { name: "p2p-parser", url: "http://p2p-parser:4002/health" },
            { name: "rapira-parser", url: "http://rapira-parser:4003/health" },
            {
              name: "deal-automation",
              url: "http://deal-automation:4004/health",
            },
            {
              name: "notification-service",
              url: "http://notification-service:4005/health",
            },
            {
              name: "reporting-service",
              url: "http://reporting-service:4006/health",
            },
          ];

          const statusChecks = services.map(async (service) => {
            try {
              const axios = require("axios");
              const response = await axios.get(service.url, { timeout: 5000 });
              return {
                name: service.name,
                status: "healthy",
                responseTime: response.headers["x-response-time"] || "N/A",
              };
            } catch (error) {
              return {
                name: service.name,
                status: "unhealthy",
                error: "Service unavailable",
              };
            }
          });

          const results = await Promise.all(statusChecks);
          res.json({
            gateway: "healthy",
            services: results,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          res.status(500).json({ error: "Failed to check service status" });
        }
      }
    );

    // Root route
    this.app.get("/", (req: express.Request, res: express.Response) => {
      res.json({
        service: "Exchange Rate System API Gateway",
        version: "1.0.0",
        status: "running",
        documentation: "/api-docs",
        endpoints: {
          auth: {
            login: "POST /auth/login",
            logout: "POST /auth/logout",
            profile: "GET /auth/me",
          },
          services: {
            pricing: "/api/v1/pricing/*",
            p2p: "/api/v1/p2p/*",
            rapira: "/api/v1/rapira/*",
            deals: "/api/v1/deals/*",
            notifications: "/api/v1/notifications/*",
            reports: "/api/v1/reports/*",
          },
          status: "/api/v1/status",
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupProxies(): void {
    const authenticateToken = (this.app as any).authenticateToken;

    // Pricing Core Service proxy
    this.app.use(
      "/api/v1/pricing",
      authenticateToken,
      createProxyMiddleware({
        target: process.env.PRICING_CORE_URL || "http://pricing-core:4001",
        changeOrigin: true,
        pathRewrite: {
          "^/api/v1/pricing": "/api/v1/pricing",
        },
        onError: (err: any, req: express.Request, res: express.Response) => {
          console.error("Pricing Core proxy error:", err);
          (res as express.Response)
            .status(502)
            .json({ error: "Pricing service unavailable" });
        },
      })
    );

    // P2P Parser Service proxy
    this.app.use(
      "/api/v1/p2p",
      authenticateToken,
      createProxyMiddleware({
        target: process.env.P2P_PARSER_URL || "http://p2p-parser:4002",
        changeOrigin: true,
        pathRewrite: {
          "^/api/v1/p2p": "/api/v1",
        },
        onError: (err: any, req: express.Request, res: express.Response) => {
          console.error("P2P Parser proxy error:", err);
          (res as express.Response)
            .status(502)
            .json({ error: "P2P service unavailable" });
        },
      })
    );

    // Rapira Parser Service proxy
    this.app.use(
      "/api/v1/rapira",
      authenticateToken,
      createProxyMiddleware({
        target: process.env.RAPIRA_PARSER_URL || "http://rapira-parser:4003",
        changeOrigin: true,
        pathRewrite: {
          "^/api/v1/rapira": "/api/v1",
        },
        onError: (err: any, req: express.Request, res: express.Response) => {
          console.error("Rapira Parser proxy error:", err);
          (res as express.Response)
            .status(502)
            .json({ error: "Rapira service unavailable" });
        },
      })
    );

    // Deal Automation Service proxy
    this.app.use(
      "/api/v1/deals",
      authenticateToken,
      createProxyMiddleware({
        target:
          process.env.DEAL_AUTOMATION_URL || "http://deal-automation:4004",
        changeOrigin: true,
        pathRewrite: {
          "^/api/v1/deals": "/api/v1",
        },
        onError: (err: any, req: express.Request, res: express.Response) => {
          console.error("Deal Automation proxy error:", err);
          (res as express.Response)
            .status(502)
            .json({ error: "Deal service unavailable" });
        },
      })
    );

    // Notification Service proxy
    this.app.use(
      "/api/v1/notifications",
      authenticateToken,
      createProxyMiddleware({
        target:
          process.env.NOTIFICATION_SERVICE_URL ||
          "http://notification-service:4005",
        changeOrigin: true,
        pathRewrite: {
          "^/api/v1/notifications": "/api/v1",
        },
        onError: (err: any, req: express.Request, res: express.Response) => {
          console.error("Notification Service proxy error:", err);
          (res as express.Response)
            .status(502)
            .json({ error: "Notification service unavailable" });
        },
      })
    );

    // Reporting Service proxy
    this.app.use(
      "/api/v1/reports",
      authenticateToken,
      createProxyMiddleware({
        target:
          process.env.REPORTING_SERVICE_URL || "http://reporting-service:4006",
        changeOrigin: true,
        pathRewrite: {
          "^/api/v1/reports": "/api/v1/reports",
        },
        onError: (err: any, req: express.Request, res: express.Response) => {
          console.error("Reporting Service proxy error:", err);
          (res as express.Response)
            .status(502)
            .json({ error: "Reporting service unavailable" });
        },
      })
    );
  }

  private setupSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Exchange Rate System API Gateway",
          version: "1.0.0",
          description: "Unified API for exchange rate microservices system",
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 3002}`,
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
      apis: ["./src/index.ts"],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use("*", (req: express.Request, res: express.Response) => {
      res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
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
        console.error("Gateway error:", error);
        res.status(error.status || 500).json({
          error: error.message || "Internal server error",
          timestamp: new Date().toISOString(),
        });
      }
    );
  }

  async start(): Promise<void> {
    try {
      const port = process.env.PORT || 3002;
      this.server = this.app.listen(port, () => {
        console.log(`API Gateway started on port ${port}`);
        console.log(`API Documentation: http://localhost:${port}/api-docs`);
        console.log(`Health Check: http://localhost:${port}/health`);
      });

      this.setupGracefulShutdown();
    } catch (error) {
      console.error("Failed to start API Gateway:", error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);

      if (this.server) {
        this.server.close(() => {
          console.log("API Gateway shut down gracefully");
          process.exit(0);
        });
      }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  }
}

// Start the gateway
const gateway = new ApiGateway();

if (require.main === module) {
  gateway.start().catch((error) => {
    console.error("Failed to start gateway:", error);
    process.exit(1);
  });
}

export default gateway;
