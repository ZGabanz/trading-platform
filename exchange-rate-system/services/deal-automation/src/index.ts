import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "deal-automation",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0",
  });
});

// Mock deal automation endpoints
app.post("/api/v1/deals", (req, res) => {
  // Mock deal creation
  res.json({
    success: true,
    data: {
      dealId: `deal_${Date.now()}`,
      status: "created",
      timestamp: new Date().toISOString(),
    },
  });
});

app.get("/api/v1/deals/status", (req, res) => {
  // Mock deal status
  res.json({
    success: true,
    data: {
      totalDeals: 42,
      pendingDeals: 3,
      completedDeals: 38,
      failedDeals: 1,
    },
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
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Deal Automation Service running on port ${PORT}`);
});
