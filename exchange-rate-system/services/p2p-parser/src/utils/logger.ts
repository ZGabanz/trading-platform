import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Custom log levels for business operations
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

// Production log format (JSON for structured logging)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    ({ timestamp, level, message, service, stack, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        service: service || "p2p-parser",
        message,
        ...(stack ? { stack } : {}),
        ...meta,
      });
    }
  )
);

// Development log format (more readable)
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${service || "p2p-parser"}] ${level}: ${message}${metaStr}`;
  })
);

// Configure transports
const transports: winston.transport[] = [
  new winston.transports.Console({
    format:
      process.env.NODE_ENV === "production"
        ? productionFormat
        : developmentFormat,
  }),
];

// Add file logging in production
if (process.env.NODE_ENV === "production") {
  // Daily rotate file for general logs
  transports.push(
    new DailyRotateFile({
      filename: "logs/p2p-parser-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      maxSize: "100m",
      format: productionFormat,
    })
  );

  // Separate file for errors
  transports.push(
    new DailyRotateFile({
      filename: "logs/p2p-parser-error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "90d",
      maxSize: "100m",
      format: productionFormat,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  ),
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === "test",
});

// Add methods to logger instance
(logger as any).addReqId = (reqId: string) => {
  return logger.child({ reqId });
};

(logger as any).addContext = (context: Record<string, any>) => {
  return logger.child(context);
};

// Business-specific logging methods
export const businessLogger = {
  parsingStarted: (symbol: string, source: string) => {
    logger.info("P2P parsing started", {
      symbol,
      source,
      component: "parser",
      event: "parsing_started",
    });
  },

  parsingCompleted: (
    symbol: string,
    source: string,
    duration: number,
    offerCount: number
  ) => {
    logger.info("P2P parsing completed", {
      symbol,
      source,
      duration,
      offerCount,
      component: "parser",
      event: "parsing_completed",
    });
  },

  parsingFailed: (
    symbol: string,
    source: string,
    error: string,
    duration: number
  ) => {
    logger.error("P2P parsing failed", {
      symbol,
      source,
      error,
      duration,
      component: "parser",
      event: "parsing_failed",
    });
  },

  dataQualityAlert: (
    symbol: string,
    source: string,
    score: number,
    issues: string[]
  ) => {
    logger.warn("P2P data quality alert", {
      symbol,
      source,
      qualityScore: score,
      issues,
      component: "quality",
      event: "quality_alert",
    });
  },

  rateLimitHit: (source: string, retryAfter: number) => {
    logger.warn("Rate limit reached", {
      source,
      retryAfter,
      component: "rate-limiter",
      event: "rate_limit_hit",
    });
  },

  cacheHit: (symbol: string, source: string, age: number) => {
    logger.debug("Cache hit", {
      symbol,
      source,
      cacheAge: age,
      component: "cache",
      event: "cache_hit",
    });
  },

  cacheMiss: (symbol: string, source: string) => {
    logger.debug("Cache miss", {
      symbol,
      source,
      component: "cache",
      event: "cache_miss",
    });
  },
};

export { logger };
