import { Request, Response, NextFunction } from "express";
import promClient from "prom-client";
import { logger } from "../utils/logger";

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default Node.js metrics
promClient.collectDefaultMetrics({ register });

// HTTP request metrics
const httpRequestDuration = new promClient.Histogram({
  name: "pricing_http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 5, 15, 50, 100, 500, 1000, 5000],
});

const httpRequestsTotal = new promClient.Counter({
  name: "pricing_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestsInProgress = new promClient.Gauge({
  name: "pricing_http_requests_in_progress",
  help: "Number of HTTP requests currently in progress",
  labelNames: ["method", "route"],
});

// Business metrics
const pricingCalculationsTotal = new promClient.Counter({
  name: "pricing_calculations_total",
  help: "Total number of pricing calculations performed",
  labelNames: ["symbol", "method", "status"],
});

const pricingCalculationDuration = new promClient.Histogram({
  name: "pricing_calculation_duration_ms",
  help: "Duration of pricing calculations in ms",
  labelNames: ["symbol", "method"],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
});

const spreadDeviations = new promClient.Histogram({
  name: "pricing_spread_deviations",
  help: "Spread deviations from expected values",
  labelNames: ["symbol"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 20],
});

const cacheHitRate = new promClient.Counter({
  name: "pricing_cache_operations_total",
  help: "Total cache operations",
  labelNames: ["operation", "result"], // operation: get/set, result: hit/miss/error
});

const externalApiCalls = new promClient.Counter({
  name: "pricing_external_api_calls_total",
  help: "Total external API calls",
  labelNames: ["service", "endpoint", "status"],
});

const externalApiDuration = new promClient.Histogram({
  name: "pricing_external_api_duration_ms",
  help: "Duration of external API calls in ms",
  labelNames: ["service", "endpoint"],
  buckets: [10, 50, 100, 500, 1000, 5000, 10000],
});

const alertsTriggered = new promClient.Counter({
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
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
      httpRequestDuration.observe(
        { method, route, status_code: statusCode },
        duration
      );
      httpRequestsTotal.inc({ method, route, status_code: statusCode });
      httpRequestsInProgress.dec({ method, route });

      // Log slow requests
      if (duration > 1000) {
        logger.warn("Slow HTTP request detected", {
          method,
          route,
          duration,
          statusCode,
          component: "metrics",
        });
      }
    } catch (error) {
      logger.error("Error recording HTTP metrics", {
        error,
        component: "metrics",
      });
    }
  });

  next();
};

// Business metrics helpers
export const recordPricingCalculation = (
  symbol: string,
  method: string,
  duration: number,
  success: boolean
): void => {
  const status = success ? "success" : "error";

  pricingCalculationsTotal.inc({ symbol, method, status });
  pricingCalculationDuration.observe({ symbol, method }, duration);
};

export const recordSpreadDeviation = (
  symbol: string,
  deviation: number
): void => {
  spreadDeviations.observe({ symbol }, Math.abs(deviation));
};

export const recordCacheOperation = (
  operation: "get" | "set",
  result: "hit" | "miss" | "error"
): void => {
  cacheHitRate.inc({ operation, result });
};

export const recordExternalApiCall = (
  service: string,
  endpoint: string,
  duration: number,
  success: boolean
): void => {
  const status = success ? "success" : "error";

  externalApiCalls.inc({ service, endpoint, status });
  externalApiDuration.observe({ service, endpoint }, duration);
};

export const recordAlert = (
  type: string,
  severity: string,
  symbol?: string
): void => {
  alertsTriggered.inc({ type, severity, symbol: symbol || "unknown" });
};

// Metrics endpoint handler
export const getMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error("Error generating metrics", { error, component: "metrics" });
    res.status(500).end("Error generating metrics");
  }
};

// Health metrics
export const updateHealthMetric = (healthy: boolean): void => {
  // This could be expanded to track various health indicators
  logger.debug("Health status updated", { healthy, component: "metrics" });
};

export { register };
