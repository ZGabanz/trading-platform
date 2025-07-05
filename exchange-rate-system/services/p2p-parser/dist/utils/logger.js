"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.businessLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
// Custom log levels for business operations
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
};
// Production log format (JSON for structured logging)
const productionFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ timestamp, level, message, service, stack, ...meta }) => {
    return JSON.stringify({
        timestamp,
        level,
        service: service || "p2p-parser",
        message,
        ...(stack ? { stack } : {}),
        ...meta,
    });
}));
// Development log format (more readable)
const developmentFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: "HH:mm:ss" }), winston_1.default.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${service || "p2p-parser"}] ${level}: ${message}${metaStr}`;
}));
// Configure transports
const transports = [
    new winston_1.default.transports.Console({
        format: process.env.NODE_ENV === "production"
            ? productionFormat
            : developmentFormat,
    }),
];
// Add file logging in production
if (process.env.NODE_ENV === "production") {
    // Daily rotate file for general logs
    transports.push(new winston_daily_rotate_file_1.default({
        filename: "logs/p2p-parser-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxFiles: "30d",
        maxSize: "100m",
        format: productionFormat,
    }));
    // Separate file for errors
    transports.push(new winston_daily_rotate_file_1.default({
        filename: "logs/p2p-parser-error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        level: "error",
        maxFiles: "90d",
        maxSize: "100m",
        format: productionFormat,
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
// Business-specific logging methods
exports.businessLogger = {
    parsingStarted: (symbol, source) => {
        logger.info("P2P parsing started", {
            symbol,
            source,
            component: "parser",
            event: "parsing_started",
        });
    },
    parsingCompleted: (symbol, source, duration, offerCount) => {
        logger.info("P2P parsing completed", {
            symbol,
            source,
            duration,
            offerCount,
            component: "parser",
            event: "parsing_completed",
        });
    },
    parsingFailed: (symbol, source, error, duration) => {
        logger.error("P2P parsing failed", {
            symbol,
            source,
            error,
            duration,
            component: "parser",
            event: "parsing_failed",
        });
    },
    dataQualityAlert: (symbol, source, score, issues) => {
        logger.warn("P2P data quality alert", {
            symbol,
            source,
            qualityScore: score,
            issues,
            component: "quality",
            event: "quality_alert",
        });
    },
    rateLimitHit: (source, retryAfter) => {
        logger.warn("Rate limit reached", {
            source,
            retryAfter,
            component: "rate-limiter",
            event: "rate_limit_hit",
        });
    },
    cacheHit: (symbol, source, age) => {
        logger.debug("Cache hit", {
            symbol,
            source,
            cacheAge: age,
            component: "cache",
            event: "cache_hit",
        });
    },
    cacheMiss: (symbol, source) => {
        logger.debug("Cache miss", {
            symbol,
            source,
            component: "cache",
            event: "cache_miss",
        });
    },
};
//# sourceMappingURL=logger.js.map