"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.updateHealthMetric = exports.getMetrics = exports.recordAlert = exports.recordExternalApiCall = exports.recordCacheOperation = exports.recordSpreadDeviation = exports.recordPricingCalculation = exports.metricsMiddleware = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
const logger_1 = require("../utils/logger");
// Create a Registry to register the metrics
const register = new prom_client_1.default.Registry();
exports.register = register;
// Add default Node.js metrics
prom_client_1.default.collectDefaultMetrics({ register });
// HTTP request metrics
const httpRequestDuration = new prom_client_1.default.Histogram({
    name: "pricing_http_request_duration_ms",
    help: "Duration of HTTP requests in ms",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 5, 15, 50, 100, 500, 1000, 5000],
});
const httpRequestsTotal = new prom_client_1.default.Counter({
    name: "pricing_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
});
const httpRequestsInProgress = new prom_client_1.default.Gauge({
    name: "pricing_http_requests_in_progress",
    help: "Number of HTTP requests currently in progress",
    labelNames: ["method", "route"],
});
// Business metrics
const pricingCalculationsTotal = new prom_client_1.default.Counter({
    name: "pricing_calculations_total",
    help: "Total number of pricing calculations performed",
    labelNames: ["symbol", "method", "status"],
});
const pricingCalculationDuration = new prom_client_1.default.Histogram({
    name: "pricing_calculation_duration_ms",
    help: "Duration of pricing calculations in ms",
    labelNames: ["symbol", "method"],
    buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
});
const spreadDeviations = new prom_client_1.default.Histogram({
    name: "pricing_spread_deviations",
    help: "Spread deviations from expected values",
    labelNames: ["symbol"],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 20],
});
const cacheHitRate = new prom_client_1.default.Counter({
    name: "pricing_cache_operations_total",
    help: "Total cache operations",
    labelNames: ["operation", "result"], // operation: get/set, result: hit/miss/error
});
const externalApiCalls = new prom_client_1.default.Counter({
    name: "pricing_external_api_calls_total",
    help: "Total external API calls",
    labelNames: ["service", "endpoint", "status"],
});
const externalApiDuration = new prom_client_1.default.Histogram({
    name: "pricing_external_api_duration_ms",
    help: "Duration of external API calls in ms",
    labelNames: ["service", "endpoint"],
    buckets: [10, 50, 100, 500, 1000, 5000, 10000],
});
const alertsTriggered = new prom_client_1.default.Counter({
    name: "pricing_alerts_triggered_total",
    help: "Total number of alerts triggered",
    labelNames: ["type", "severity", "symbol"],
});
// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestsInProgress);
register.registerMetric(pricingCalculationsTotal);
register.registerMetric(pricingCalculationDuration);
register.registerMetric(spreadDeviations);
register.registerMetric(cacheHitRate);
register.registerMetric(externalApiCalls);
register.registerMetric(externalApiDuration);
register.registerMetric(alertsTriggered);
// Middleware function
const metricsMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const route = req.route?.path || req.path;
    const method = req.method;
    // Track requests in progress
    httpRequestsInProgress.inc({ method, route });
    // Listen for response completion
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode.toString();
        try {
            // Record HTTP metrics
            httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
            httpRequestsTotal.inc({ method, route, status_code: statusCode });
            httpRequestsInProgress.dec({ method, route });
            // Log slow requests
            if (duration > 1000) {
                logger_1.logger.warn("Slow HTTP request detected", {
                    method,
                    route,
                    duration,
                    statusCode,
                    component: "metrics",
                });
            }
        }
        catch (error) {
            logger_1.logger.error("Error recording HTTP metrics", {
                error,
                component: "metrics",
            });
        }
    });
    next();
};
exports.metricsMiddleware = metricsMiddleware;
// Business metrics helpers
const recordPricingCalculation = (symbol, method, duration, success) => {
    const status = success ? "success" : "error";
    pricingCalculationsTotal.inc({ symbol, method, status });
    pricingCalculationDuration.observe({ symbol, method }, duration);
};
exports.recordPricingCalculation = recordPricingCalculation;
const recordSpreadDeviation = (symbol, deviation) => {
    spreadDeviations.observe({ symbol }, Math.abs(deviation));
};
exports.recordSpreadDeviation = recordSpreadDeviation;
const recordCacheOperation = (operation, result) => {
    cacheHitRate.inc({ operation, result });
};
exports.recordCacheOperation = recordCacheOperation;
const recordExternalApiCall = (service, endpoint, duration, success) => {
    const status = success ? "success" : "error";
    externalApiCalls.inc({ service, endpoint, status });
    externalApiDuration.observe({ service, endpoint }, duration);
};
exports.recordExternalApiCall = recordExternalApiCall;
const recordAlert = (type, severity, symbol) => {
    alertsTriggered.inc({ type, severity, symbol: symbol || "unknown" });
};
exports.recordAlert = recordAlert;
// Metrics endpoint handler
const getMetrics = async (req, res) => {
    try {
        res.set("Content-Type", register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
    }
    catch (error) {
        logger_1.logger.error("Error generating metrics", { error, component: "metrics" });
        res.status(500).end("Error generating metrics");
    }
};
exports.getMetrics = getMetrics;
// Health metrics
const updateHealthMetric = (healthy) => {
    // This could be expanded to track various health indicators
    logger_1.logger.debug("Health status updated", { healthy, component: "metrics" });
};
exports.updateHealthMetric = updateHealthMetric;
//# sourceMappingURL=metrics.js.map