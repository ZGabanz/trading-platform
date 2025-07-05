import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

/**
 * Reporting Service
 * Provides comprehensive reporting and analytics for the exchange rate system
 */
class ReportingService {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupSwagger();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGINS?.split(",") || [
          "http://localhost:3000",
          "http://localhost:3001",
        ],
        credentials: true,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
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

  private setupRoutes(): void {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        service: "Reporting Service",
        status: "running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Reporting endpoints
    this.app.get("/api/v1/reports/pricing", async (req, res) => {
      try {
        // Mock pricing report data
        const report = {
          period: req.query.period || "daily",
          data: {
            totalCalculations: 1250,
            averageSpread: 0.15,
            volatilityIndex: 2.3,
            topCurrencyPairs: [
              { pair: "USD/RUB", volume: 45000, spread: 0.12 },
              { pair: "EUR/RUB", volume: 32000, spread: 0.18 },
              { pair: "BTC/USD", volume: 28000, spread: 0.25 },
            ],
            trends: {
              spreadTrend: "decreasing",
              volumeTrend: "increasing",
              volatilityTrend: "stable",
            },
          },
          generatedAt: new Date().toISOString(),
        };
        res.json(report);
      } catch (error) {
        res.status(500).json({ error: "Failed to generate pricing report" });
      }
    });

    this.app.get("/api/v1/reports/partners", async (req, res) => {
      try {
        // Mock partner performance report
        const report = {
          period: req.query.period || "daily",
          data: {
            totalPartners: 15,
            activePartners: 12,
            totalVolume: 125000,
            averageMargin: 0.85,
            topPerformers: [
              { id: 1, name: "Partner Alpha", volume: 35000, margin: 0.92 },
              { id: 2, name: "Partner Beta", volume: 28000, margin: 0.88 },
              { id: 3, name: "Partner Gamma", volume: 22000, margin: 0.83 },
            ],
            performance: {
              volumeGrowth: "+12%",
              marginTrend: "stable",
              retention: "95%",
            },
          },
          generatedAt: new Date().toISOString(),
        };
        res.json(report);
      } catch (error) {
        res.status(500).json({ error: "Failed to generate partner report" });
      }
    });

    this.app.get("/api/v1/reports/deals", async (req, res) => {
      try {
        // Mock deals report
        const report = {
          period: req.query.period || "daily",
          data: {
            totalDeals: 856,
            successfulDeals: 847,
            failedDeals: 9,
            successRate: 98.9,
            totalVolume: 2450000,
            averageDealSize: 2863,
            automation: {
              autoClosedDeals: 820,
              manualDeals: 36,
              automationRate: 95.8,
            },
            performance: {
              averageProcessingTime: "2.3s",
              p95ProcessingTime: "5.1s",
              errorRate: "1.1%",
            },
          },
          generatedAt: new Date().toISOString(),
        };
        res.json(report);
      } catch (error) {
        res.status(500).json({ error: "Failed to generate deals report" });
      }
    });

    this.app.get("/api/v1/reports/p2p", async (req, res) => {
      try {
        // Mock P2P market analysis
        const report = {
          period: req.query.period || "daily",
          data: {
            totalOffers: 1580,
            averageSpread: 0.22,
            marketCoverage: 85,
            exchanges: {
              bybit: { offers: 890, avgSpread: 0.2, reliability: 98.5 },
              htx: { offers: 690, avgSpread: 0.24, reliability: 96.2 },
            },
            topSellers: [
              {
                seller: "Seller_A",
                volume: 150000,
                spread: 0.18,
                rating: 99.2,
              },
              {
                seller: "Seller_B",
                volume: 125000,
                spread: 0.21,
                rating: 98.8,
              },
              { seller: "Seller_C", volume: 98000, spread: 0.19, rating: 99.1 },
            ],
            trends: {
              spreadTrend: "stable",
              volumeTrend: "increasing",
              liquidityTrend: "improving",
            },
          },
          generatedAt: new Date().toISOString(),
        };
        res.json(report);
      } catch (error) {
        res.status(500).json({ error: "Failed to generate P2P report" });
      }
    });

    this.app.get("/api/v1/reports/dashboard", async (req, res) => {
      try {
        // Mock dashboard summary
        const dashboard = {
          summary: {
            totalVolume24h: 2450000,
            activeDeals: 23,
            systemHealth: "excellent",
            alertsCount: 2,
          },
          pricing: {
            activePairs: 12,
            avgSpread: 0.15,
            lastUpdate: new Date().toISOString(),
          },
          partners: {
            active: 12,
            total: 15,
            avgMargin: 0.85,
          },
          alerts: [
            {
              type: "warning",
              message: "High volatility detected for BTC/USD",
              timestamp: new Date().toISOString(),
            },
            {
              type: "info",
              message: "New partner registered",
              timestamp: new Date().toISOString(),
            },
          ],
          generatedAt: new Date().toISOString(),
        };
        res.json(dashboard);
      } catch (error) {
        res.status(500).json({ error: "Failed to generate dashboard data" });
      }
    });

    // Export endpoints
    this.app.get("/api/v1/exports/csv/:reportType", async (req, res) => {
      try {
        const { reportType } = req.params;
        // Mock CSV export
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${reportType}-${Date.now()}.csv"`
        );
        res.send(
          "Date,Value,Volume,Spread\n2024-01-01,100,1000,0.15\n2024-01-02,102,1100,0.16"
        );
      } catch (error) {
        res.status(500).json({ error: "Failed to export CSV" });
      }
    });

    // Root route
    this.app.get("/", (req, res) => {
      res.json({
        service: "Reporting Service",
        version: "1.0.0",
        status: "running",
        endpoints: {
          pricing: "/api/v1/reports/pricing",
          partners: "/api/v1/reports/partners",
          deals: "/api/v1/reports/deals",
          p2p: "/api/v1/reports/p2p",
          dashboard: "/api/v1/reports/dashboard",
          exports: "/api/v1/exports/csv/:reportType",
        },
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

  private setupErrorHandling(): void {
    this.app.use(
      (
        error: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Error:", error);
        res.status(500).json({
          error: "Internal server error",
          timestamp: new Date().toISOString(),
        });
      }
    );
  }

  private setupSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Reporting Service API",
          version: "1.0.0",
          description: "Exchange rate system reporting and analytics API",
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 4006}`,
            description: "Development server",
          },
        ],
      },
      apis: ["./src/index.ts"],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  async start(): Promise<void> {
    try {
      const port = process.env.PORT || 4006;
      this.server = this.app.listen(port, () => {
        console.log(`Reporting Service started on port ${port}`);
        console.log(`API Documentation: http://localhost:${port}/api-docs`);
      });

      this.setupGracefulShutdown();
    } catch (error) {
      console.error("Failed to start Reporting Service:", error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);

      if (this.server) {
        this.server.close(() => {
          console.log("Reporting Service shut down gracefully");
          process.exit(0);
        });
      }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  }
}

// Start the service
const service = new ReportingService();

if (require.main === module) {
  service.start().catch((error) => {
    console.error("Failed to start service:", error);
    process.exit(1);
  });
}

export default service;
