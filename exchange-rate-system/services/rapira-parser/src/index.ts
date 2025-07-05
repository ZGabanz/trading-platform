import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "rapira-parser",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0",
  });
});

// Mock Rapira API endpoint
app.get("/api/v1/rapira/rates/:symbol", (req, res) => {
  const { symbol } = req.params;

  // Mock data for now
  res.json({
    success: true,
    data: {
      symbol,
      rate: Math.random() * 2 + 0.5, // Random rate between 0.5-2.5
      timestamp: new Date().toISOString(),
      source: "rapira",
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
  console.log(`🚀 Rapira Parser Service running on port ${PORT}`);
});
