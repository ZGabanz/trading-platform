import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 4002;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});
app.use(limiter);

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "p2p-parser",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  });
});

// Basic P2P endpoints (placeholder)
app.get("/api/v1/p2p/parse/:symbol", (req, res) => {
  const { symbol } = req.params;

  logger.info("P2P parsing request received", {
    symbol,
    ip: req.ip,
    component: "api",
  });

  // Mock response for now
  res.json({
    success: true,
    data: {
      symbol,
      source: "BYBIT",
      weightedAveragePrice: 1.085,
      offerCount: 25,
      timestamp: new Date().toISOString(),
    },
    message: "P2P parsing service is running (mock data)",
  });
});

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error", {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      component: "error-handler",
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`P2P Parser Service started`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    service: "p2p-parser",
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");

  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");

  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

export default app;
