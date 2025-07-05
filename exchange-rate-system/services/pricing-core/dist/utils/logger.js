"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
// Define log levels
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define colors for each log level
const logColors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue",
};
// Add colors to winston
winston_1.default.addColors(logColors);
// Custom format for console output
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length
        ? JSON.stringify(meta, null, 2)
        : "";
    return `${timestamp} [${service || "pricing-core"}] ${level}: ${message} ${metaStr}`;
}));
// Custom format for file output
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, service, stack, ...meta }) => {
    return JSON.stringify({
        timestamp,
        level,
        service: service || "pricing-core",
        message,
        ...(stack ? { stack } : {}),
        ...meta,
    });
}));
// Create transports
const transports = [
    // Console transport
    new winston_1.default.transports.Console({
        level: process.env.LOG_LEVEL || "info",
        format: consoleFormat,
    }),
    // Daily rotate file for all logs
    new winston_daily_rotate_file_1.default({
        filename: "logs/pricing-core-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        level: "info",
        format: fileFormat,
    }),
    // Daily rotate file for error logs only
    new winston_daily_rotate_file_1.default({
        filename: "logs/pricing-core-error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "30d",
        level: "error",
        format: fileFormat,
    }),
];
// Add HTTP logs in development
if (process.env.NODE_ENV === "development") {
    transports.push(new winston_daily_rotate_file_1.default({
        filename: "logs/pricing-core-http-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "10m",
        maxFiles: "7d",
        level: "http",
        format: fileFormat,
    }));
}
// Create the logger
const logger = winston_1.default.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true })),
    transports,
    exitOnError: false,
    silent: process.env.NODE_ENV === "test",
});
exports.logger = logger;
// Add methods to logger instance
logger.addReqId = (reqId) => {
    return logger.child({ reqId });
};
logger.addContext = (context) => {
    return logger.child(context);
};
// Structured logging methods
exports.Logger = {
    // Basic logging methods
    error: (message, error, meta) => {
        logger.error(message, { error, ...meta });
    },
    warn: (message, meta) => {
        logger.warn(message, meta);
    },
    info: (message, meta) => {
        logger.info(message, meta);
    },
    debug: (message, meta) => {
        logger.debug(message, meta);
    },
    http: (message, meta) => {
        logger.http(message, meta);
    },
    // Business-specific logging methods
    pricing: {
        calculation: (symbol, method, duration, meta) => {
            logger.info(`Pricing calculation completed`, {
                symbol,
                method,
                duration,
                component: "pricing",
                ...meta,
            });
        },
        error: (symbol, error, meta) => {
            logger.error(`Pricing calculation failed`, {
                symbol,
                error: error.message,
                stack: error.stack,
                component: "pricing",
                ...meta,
            });
        },
        spreadUpdate: (symbol, oldSpread, newSpread, updatedBy) => {
            logger.info(`Spread configuration updated`, {
                symbol,
                oldSpread,
                newSpread,
                updatedBy,
                component: "spread-config",
            });
        },
        alert: (alertType, symbol, severity, meta) => {
            logger.warn(`Pricing alert triggered`, {
                alertType,
                symbol,
                severity,
                component: "alerts",
                ...meta,
            });
        },
    },
    // Performance logging
    performance: {
        start: (operation, meta) => {
            const startTime = Date.now();
            return {
                end: (additionalMeta) => {
                    const duration = Date.now() - startTime;
                    logger.info(`Performance: ${operation}`, {
                        operation,
                        duration,
                        component: "performance",
                        ...meta,
                        ...additionalMeta,
                    });
                    return duration;
                },
            };
        },
        slow: (operation, duration, threshold, meta) => {
            logger.warn(`Slow operation detected`, {
                operation,
                duration,
                threshold,
                component: "performance",
                ...meta,
            });
        },
    },
    // API logging
    api: {
        request: (method, url, statusCode, duration, meta) => {
            logger.http(`API ${method} ${url}`, {
                method,
                url,
                statusCode,
                duration,
                component: "api",
                ...meta,
            });
        },
        error: (method, url, error, meta) => {
            logger.error(`API error ${method} ${url}`, {
                method,
                url,
                error: error.message,
                stack: error.stack,
                component: "api",
                ...meta,
            });
        },
    },
    // Database logging
    database: {
        query: (query, duration, meta) => {
            logger.debug(`Database query executed`, {
                query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
                duration,
                component: "database",
                ...meta,
            });
        },
        error: (query, error, meta) => {
            logger.error(`Database query failed`, {
                query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
                error: error.message,
                component: "database",
                ...meta,
            });
        },
        connection: (event, meta) => {
            const level = event === "error" ? "error" : "info";
            logger[level](`Database ${event}`, {
                event,
                component: "database",
                ...meta,
            });
        },
    },
    // Cache logging
    cache: {
        hit: (key, meta) => {
            logger.debug(`Cache hit`, {
                key,
                component: "cache",
                ...meta,
            });
        },
        miss: (key, meta) => {
            logger.debug(`Cache miss`, {
                key,
                component: "cache",
                ...meta,
            });
        },
        set: (key, ttl, meta) => {
            logger.debug(`Cache set`, {
                key,
                ttl,
                component: "cache",
                ...meta,
            });
        },
        error: (operation, key, error, meta) => {
            logger.error(`Cache error`, {
                operation,
                key,
                error: error.message,
                component: "cache",
                ...meta,
            });
        },
    },
    // External API logging
    external: {
        request: (service, endpoint, duration, meta) => {
            logger.debug(`External API request`, {
                service,
                endpoint,
                duration,
                component: "external-api",
                ...meta,
            });
        },
        error: (service, endpoint, error, meta) => {
            logger.error(`External API error`, {
                service,
                endpoint,
                error: error.message,
                component: "external-api",
                ...meta,
            });
        },
        rateLimit: (service, endpoint, meta) => {
            logger.warn(`External API rate limited`, {
                service,
                endpoint,
                component: "external-api",
                ...meta,
            });
        },
    },
};
exports.default = exports.Logger;
//# sourceMappingURL=logger.js.map