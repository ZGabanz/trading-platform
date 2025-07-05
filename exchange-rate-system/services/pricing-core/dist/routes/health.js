"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const logger_1 = require("../utils/logger");
const metrics_1 = require("../middleware/metrics");
const router = (0, express_1.Router)();
exports.healthRoutes = router;
/**
 * Basic health check endpoint
 * GET /health
 */
router.get("/", async (req, res) => {
    try {
        const healthCheck = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.APP_VERSION || "1.0.0",
            dependencies: {},
        };
        // Check database connection
        const dbStatus = await checkDatabase();
        healthCheck.dependencies.database = dbStatus;
        // Check Redis connection
        const redisStatus = await checkRedis();
        healthCheck.dependencies.redis = redisStatus;
        // Check external APIs
        const externalApiStatus = await checkExternalAPIs();
        healthCheck.dependencies.externalApis = externalApiStatus;
        // Determine overall status
        const dependencyStatuses = Object.values(healthCheck.dependencies).map((dep) => dep.status);
        if (dependencyStatuses.some((status) => status === "unhealthy")) {
            healthCheck.status = "unhealthy";
            res.status(503);
        }
        else if (dependencyStatuses.some((status) => status === "degraded")) {
            healthCheck.status = "degraded";
            res.status(200);
        }
        else {
            healthCheck.status = "healthy";
            res.status(200);
        }
        res.json(healthCheck);
    }
    catch (error) {
        logger_1.logger.error("Health check failed", { error });
        res.status(503).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: "Health check failed",
        });
    }
});
/**
 * Readiness probe endpoint
 * GET /health/ready
 */
router.get("/ready", async (req, res) => {
    try {
        // Check if service is ready to handle requests
        const isReady = await checkReadiness();
        if (isReady) {
            res.status(200).json({
                status: "ready",
                timestamp: new Date().toISOString(),
            });
        }
        else {
            res.status(503).json({
                status: "not_ready",
                timestamp: new Date().toISOString(),
            });
        }
    }
    catch (error) {
        logger_1.logger.error("Readiness check failed", { error });
        res.status(503).json({
            status: "not_ready",
            timestamp: new Date().toISOString(),
            error: "Readiness check failed",
        });
    }
});
/**
 * Liveness probe endpoint
 * GET /health/live
 */
router.get("/live", (req, res) => {
    // Simple liveness check - if we can respond, we're alive
    res.status(200).json({
        status: "alive",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
/**
 * Metrics endpoint for Prometheus
 * GET /health/metrics
 */
router.get("/metrics", metrics_1.getMetrics);
// Helper functions for health checks
async function checkDatabase() {
    try {
        const startTime = Date.now();
        // TODO: Implement actual database connection check
        // For now, simulate a check
        await new Promise((resolve) => setTimeout(resolve, 10));
        const responseTime = Date.now() - startTime;
        return {
            status: "healthy",
            responseTime,
        };
    }
    catch (error) {
        return {
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown database error",
        };
    }
}
async function checkRedis() {
    try {
        const startTime = Date.now();
        // TODO: Implement actual Redis connection check
        // For now, simulate a check
        await new Promise((resolve) => setTimeout(resolve, 5));
        const responseTime = Date.now() - startTime;
        return {
            status: "healthy",
            responseTime,
        };
    }
    catch (error) {
        return {
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown Redis error",
        };
    }
}
async function checkExternalAPIs() {
    try {
        const startTime = Date.now();
        // TODO: Implement actual external API checks
        // For now, simulate a check
        await new Promise((resolve) => setTimeout(resolve, 20));
        const responseTime = Date.now() - startTime;
        return {
            status: "healthy",
            responseTime,
        };
    }
    catch (error) {
        return {
            status: "unhealthy",
            error: error instanceof Error ? error.message : "External API check failed",
        };
    }
}
async function checkReadiness() {
    try {
        // Check all critical dependencies
        const dbStatus = await checkDatabase();
        const redisStatus = await checkRedis();
        return dbStatus.status === "healthy" && redisStatus.status === "healthy";
    }
    catch (error) {
        logger_1.logger.error("Readiness check error", { error });
        return false;
    }
}
//# sourceMappingURL=health.js.map