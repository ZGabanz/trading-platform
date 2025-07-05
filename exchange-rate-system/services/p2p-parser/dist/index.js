"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4002;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: "Too many requests from this IP, please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
    },
});
app.use(limiter);
// Compression and parsing
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
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
    logger_1.logger.info("P2P parsing request received", {
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
app.use((err, req, res, next) => {
    logger_1.logger.error("Unhandled error", {
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
});
// Start server
const server = app.listen(PORT, () => {
    logger_1.logger.info(`P2P Parser Service started`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        service: "p2p-parser",
    });
});
// Graceful shutdown
process.on("SIGTERM", () => {
    logger_1.logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => {
        logger_1.logger.info("Process terminated");
        process.exit(0);
    });
});
process.on("SIGINT", () => {
    logger_1.logger.info("SIGINT received, shutting down gracefully");
    server.close(() => {
        logger_1.logger.info("Process terminated");
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map